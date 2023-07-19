import { createCanvas, serve } from "./deps.ts";
import { getContributions } from "./contributions.ts";
import { renderContributions } from "./renderCanvas.ts";

const port = 8080;

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const user = url.searchParams.get("user");

  const data = await getContributions(user!);

  const canvas = createCanvas(670, 140);
  const ctx = canvas.getContext("2d");

  if (data?.data?.user !== null) {
    renderContributions(
      ctx,
      data.data.user.contributionsCollection.contributionCalendar,
    );
  }

  const headers = new Headers();
  headers.set("content-type", "image/png");

  const response = new Response(canvas.toBuffer(), {
    headers: headers,
    status: 200,
  });

  return response;
};

console.log(`HTTP webserver running. Access it at: http://localhost:8080/`);
await serve(handler, { port });
