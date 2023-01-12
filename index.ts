import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

//
const client_id = Deno.env.get("CLIENT_ID");
const redirect_uri = Deno.env.get("REDIRECT_URI");
const client_secret = Deno.env.get("CLIENT_SECRET");

// handle /spotify-login route
app.use(async (ctx) => {
  if (ctx.request.url.pathname === "/") {
    const state = "some-state-of-my-choice";
    const url = new URL("https://accounts.spotify.com/authorize");

    url.searchParams.append("client_id", client_id);
    url.searchParams.append("response_type", "code");
    url.searchParams.append("redirect_uri", redirect_uri);
    url.searchParams.append(
      "scope",
      "user-read-private user-read-email playlist-modify-public playlist-modify-private"
    );
    url.searchParams.append("state", state);
    // redirect to spotify login page
    ctx.response.redirect(url.toString());
  }
  // handle /spotify-callback route
  if (ctx.request.url.pathname === "/callback") {
    const code = ctx.request.url.searchParams.get("code");
    const url = new URL("https://accounts.spotify.com/api/token");
    const body = new URLSearchParams();
    body.append("grant_type", "authorization_code");
    body.append("code", code);
    body.append("redirect_uri", redirect_uri);
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${client_id}:${client_secret}`)}`,
      },
      body,
    });
    const data = await response.json();
    ctx.response.body = data;
  }
});

await app.listen({ port: 8000 });
