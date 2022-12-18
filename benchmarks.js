const autocannon = require("autocannon");

async function foo() {
  const result = await autocannon({
    // url: "http://localhost:8000",
    url: "https://vamshi9666-deno.deno.dev/",
    // connections: 10, //default
    pipelining: 1, // default
    // duration: 1, // default
    amount: 100, // default
  });
  console.log(result);
}

foo();

async function run() {
  const got = await (await import("got")).default;
  const fs = require("fs");
  // initate got instance

  const api = got.extend({
    prefixUrl: "https://vamshi9666-deno.deno.dev/",
  });
  // make 100 requests in parallel in 1 second within loop
  const requests = new Array(10000).fill(api.get("api").text());

  // wait for all requests to complete
  const responses = await Promise.all(requests);

  // print the response body
  // console.log(responses);
  // save the response body to a file
  fs.writeFileSync("response.json", JSON.stringify(responses, null, 2));
}

run();
