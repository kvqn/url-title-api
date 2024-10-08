import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors());

app.get("*", async (c) => {
  const { pathname } = new URL(c.req.url);
  let requestedUrl: string = pathname.substring(1);
  ["http:/", "https:/"].forEach((prefix) => {
    if (requestedUrl.startsWith(prefix))
      requestedUrl = requestedUrl.substring(prefix.length);
  });
  requestedUrl = `http://${requestedUrl}`;

  try {
    const url = new URL(requestedUrl);
    const html = await fetch(url.href).then((res) => res.text());
    const matches = html.match(/<title>(.*?)<\/title>/);
    const title = matches?.[1] ?? "";
    return c.json({
      title: title,
    });
  } catch (err) {
    return c.json(
      {
        error: err,
      },
    );
  }
});

let port = parseInt(process.env.PORT);
if (isNaN(port)) port = 3000;

console.log(`Listening on port ${port}`);

export default {
  fetch: app.fetch,
  port: port,
};
