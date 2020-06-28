const endpoints = {
  "/image": async function (request, response, browser, queryString) {
    const parameter = queryString.split("&")[0];
    let error;
    if (typeof parameter === "string") {
      const [name, url] = parameter.split("=");
      if (typeof name === "string" && typeof url === "string") {
        const imageResponse = await getImage(name, url, browser);
        if (imageResponse.response) {
          response.writeHead(200, {
            "Content-Type": "image/jpeg",
            "Content-Length": imageResponse.response.length,
          });
          try {
            await response.write(imageResponse.response);
          } catch (e) {
            console.error("[Error]", e);
          } finally {
            response.end();
          }
          return error;
        } else {
          error = imageResponse.error;
        }
      } else {
        error = ["bad_query_string"];
      }
    } else {
      error = ["no_query_string"];
    }
    return error;
  },
};

async function getImage(name, url, browser) {
  const response = {
    response: undefined,
    error: undefined,
  };
  const page = await browser.newPage();
  try {
    await page.goto(url);
    response.response = await page.screenshot({ type: "jpeg", quality: 10 });
  } catch (e) {
    console.error("[Error]", e);
    response.error = ["server_does_not_respond"];
  }
  return response;
}

async function requestHandler(request, response, browser) {
  if (request.method !== "GET") {
    response.writeHead(405);
    response.write("Method not allowed");
    response.end();
    return Promise.resolve();
  }
  const [endpoint, rest] = request.url.split("?");

  if (!endpoints[endpoint]) {
    response.writeHead(403);
    response.write("Forbiden");
    response.end();
    return Promise.resolve();
  }
  try {
    const error = await endpoints[endpoint](request, response, browser, rest);
    if (typeof error !== "undefined") {
      // default
      response.writeHead(200);
      response.write(JSON.stringify(error));
      response.end();
    }
  } catch (e) {
    response.writeHead(403);
    response.write("Forbiden");
    response.end();
    return Promise.resolve();
  }

  return Promise.resolve();
}

module.exports = requestHandler;
