import { Application } from "https://deno.land/x/oak/mod.ts";
import { RateLimiter } from "https://deno.land/x/oak_rate_limit/mod.ts";

const app = new Application();

const STORE = {};

// const STORE = new Store();
const rateLimit = RateLimiter({
  //   store: STORE, // Using MapStore by default.
  windowMs: 1000, // Window for the requests that can be made in miliseconds.
  max: 20, // Max requests within the predefined window.
  headers: true, // Default true, it will add the headers X-RateLimit-Limit, X-RateLimit-Remaining.
  message: "Too many requests, please try again later.", // Default message if rate limit reached.
  statusCode: 429, // Default status code if rate limit reached.
  //   onRateLimit: (ctx, next) => {
  //     // Callback when rate limit is reached.
  //     console.log("Rate limit reached");

  //   },
});

app.use(await rateLimit);

// Logger

// Timing
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

// Hello World!
app.use((ctx) => {
  ctx.response.body = "Hello World!";
});

app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

await app.listen({ port: 8000 });

console.log("Server running on port 8000");
