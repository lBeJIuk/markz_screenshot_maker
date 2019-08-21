async function goTo(name, url, browser) {
  const page = await browser.newPage();
  await page.goto(url);
  await page.screenshot({ path: `${name}.jpg` });
  await page.close();
}

async function requestHandler(request, response, browser) {
  const querystring = request.url.split("?")[1];
  const obj1 = querystring.split("&")[0];
  const [name, value] = obj1.split("=");

  await goTo(name, value, browser);
  // respond
  response.write("hello client!");
  response.end();
}

module.exports = requestHandler;
