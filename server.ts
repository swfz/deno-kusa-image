import { createCanvas } from "./deps.ts";
import { getContributions } from "./contributions.ts";
import { renderContributions } from "./renderCanvas.ts";
import { log } from "./logger.ts";

const port = 8080;

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const user = url.pathname.split("/").filter((p) => p.length > 0)[0] ?? url.searchParams.get("user") ?? null;

  const to = url.searchParams.get("to") ?? undefined;
  const theme = url.searchParams.get("theme") ?? "light";

  log(request, { user, to, theme });

  if (user === null) {
    const html = await Deno.readFile("./public/index.html");
    return new Response(html, { headers: { "content-type": "text/html" } });
  }

  const data = await getContributions(user, to);

  if (data?.data?.user === null) {
    return new Response(`Could not resolve to a User. ${user}`, {
      status: 404,
    });
  }

  const event = data.data.user.contributionsCollection.isHalloween ? "halloween" : "default";

  const canvas = createCanvas(670, 140);
  const ctx = canvas.getContext("2d");
  renderContributions(
    ctx,
    canvas.width,
    canvas.height,
    data.data.user.contributionsCollection.contributionCalendar,
    theme,
    event,
  );

  const headers = new Headers();
  headers.set("content-type", "image/png");

  const response = new Response(canvas.toBuffer(), {
    headers: headers,
    status: 200,
  });

  console.log(`${user}`);

  return response;
};

console.log(`HTTP webserver running. Access it at: http://localhost:8080/`);
Deno.serve({ port }, handler);
