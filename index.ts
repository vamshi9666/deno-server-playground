import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

// handle /spotify-login route
app.use(async (ctx) => {
  const client_id = process.env.CLIENT_ID;
  const redirect_uri = process.env.REDIRECT_URI;
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
});

await app.listen({ port: 8000 });
