import { Application } from "https://deno.land/x/oak/mod.ts";
import { config } from "https://deno.land/std/dotenv/mod.ts";

const app = new Application();

const data = await config();

const { CLIENT_ID, REDIRECT_URI, CLIENT_SECRET } = data;
const client_id = CLIENT_ID || Deno.env.get("CLIENT_ID");
const redirect_uri = Deno.env.get("REDIRECT_URI");
const client_secret = CLIENT_SECRET || Deno.env.get("CLIENT_SECRET");

console.log(data);

const getAccessToken = async () => {
  const url = new URL("https://accounts.spotify.com/api/token");
  const body = new URLSearchParams();
  body.append("grant_type", "client_credentials");
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${client_id}:${client_secret}`)}`,
    },
    body,
  });
  const data = await response.json();
  console.log("data", data);

  return data.access_token;
};
const formatTrack = (track: any) => {
  const item = track.track;
  //
  // console.log("item", Object.keys(item));

  return {
    track_spotify_id: item.id,
    preview_url: item?.preview_url || "",
    title: item?.name || "",
    artists: item.artists.map((artist: any) => {
      return {
        id: artist.id,
        name: artist.name,
        // url: artist.uri,
        // genres: artist.genres,
      };
    }),
    isrc: item?.external_ids.isrc,
  };
};
const getTracks = async (playlistId: string, accessToken: string) => {
  const url = new URL(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`
  );
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  console.log("data", data.items[0]);

  return data.items.map(formatTrack);
};

// handle /spotify-login route
app.use(async (ctx) => {
  const path = ctx.request.url.pathname;
  if (path === "/") {
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
  if (path === "/callback") {
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

  if (path === "/tracks") {
    // get playlist id's from query params
    const playlistIds = ctx.request.url.searchParams.get("ids").split(",");

    const accessToken = await getAccessToken();
    console.log(accessToken, "accessToken");

    const tracks = await Promise.all(
      playlistIds.map((eachId) => {
        return getTracks(eachId, accessToken);
      })
    );

    const allTracks = tracks.flat();

    // save to json file
    // const csvData = jsonToCsv(allTracks);
    const encoder = new TextEncoder();
    const path = await Deno.writeFile(
      "./tracks.json",
      // "./tracks.csv",
      encoder.encode(JSON.stringify(allTracks, null, 2))
    );

    // const tracks = await getTracks(playlistIds[0], accessToken);

    // get access token from query params
    ctx.response.body = "Done";
  }
});

await app.listen({ port: 8000 });
