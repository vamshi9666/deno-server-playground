const autocannon = require("autocannon");

async function foo() {
  const result = await autocannon({
    url: "http://localhost:8000",
    // connections: 10, //default
    pipelining: 1, // default
    // duration: 1, // default
    amount: 100, // default
  });
  console.log(result);
}

foo();
