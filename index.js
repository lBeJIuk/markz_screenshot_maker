const puppeteer = require("puppeteer");
const http = require("http");
const cluster = require("cluster");
const requestHandler = require("./handler");
// settings
const port = Number(process.env.PORT) || 3333;
// settings

if (cluster.isMaster) {
  cluster.fork();
  cluster.fork();
  cluster.on("exit", function(worker) {
    console.log("Worker %d died", worker.id);
    cluster.fork();
  });
} else {
  console.log("Worker %d running!", cluster.worker.id);

  const domain = require("domain");
  const server = require("http").createServer(async function(req, res) {
    const browser = await puppeteer.launch({
      args: [`--no-sandbox`]
    });
    const d = domain.create();
    d.on("error", function(er) {
      //something unexpected occurred
      console.error("error", er.stack);
      try {
        //make sure we close down within 30 seconds
        var killtimer = setTimeout(function() {
          process.exit(1);
        }, 30000);
        // But don't keep the process open just for that!
        killtimer.unref();
        //stop taking new requests.
        server.close();
        //Let the master know we're dead.  This will trigger a
        //'disconnect' in the cluster master, and then it will fork
        //a new worker.
        cluster.worker.disconnect();

        //send an error to the request that triggered the problem
        res.statusCode = 500;
        res.setHeader("content-type", "text/plain");
        res.end("Oops, there was a problem!\n");
      } catch (er2) {
        //oh well, not much we can do at this point.
        console.error("Error sending 500!", er2.stack);
      }
    });
    //Because req and res were created before this domain existed,
    //we need to explicitly add them.
    d.add(req);
    d.add(res);
    //Now run the handler function in the domain.
    d.run(function() {
      //You'd put your fancy application logic here.
      requestHandler(req, res, browser);
    });
  });
  server.listen(port);
}
