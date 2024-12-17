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
  const pastYears = url.searchParams.get("past_years") ?? undefined;

  await log(request, { user, to, theme });

  if (user === null) {
    const html = await Deno.readFile("./public/index.html");
    return new Response(html, { headers: { "content-type": "text/html" } });
  }

  const lineHeight = 140;
  const canvasHeight = pastYears ? parseInt(pastYears) * lineHeight : lineHeight;
  const canvas = createCanvas(670, canvasHeight);
  const ctx = canvas.getContext("2d");

  if (pastYears) {
    const n = parseInt(pastYears);

    for (const [index] of Array(n).entries()) {
      const year = new Date().getFullYear() - index;
      const data = await getContributions(user, `${year}-12-31`);
      const event = data.data.user.contributionsCollection.contributionCalendar.isHalloween ? "halloween" : "default";

      renderContributions(
        ctx,
        canvas.width,
        lineHeight,
        data.data.user.contributionsCollection.contributionCalendar,
        theme,
        event,
        lineHeight * (n - (index + 1)),
        year,
      );
    }
  } else {
    const data = await getContributions(user, to);

    if (data?.data?.user === null) {
      return new Response(`Could not resolve to a User. ${user}`, {
        status: 404,
      });
    }

    const event = data.data.user.contributionsCollection.contributionCalendar.isHalloween ? "halloween" : "default";
    const weeks = data.data.user.contributionsCollection.contributionCalendar.weeks;
    const term = to ? `${weeks[0].contributionDays[0].date}~${weeks.at(-1).contributionDays.at(-1).date}` : undefined;

    renderContributions(
      ctx,
      canvas.width,
      lineHeight,
      data.data.user.contributionsCollection.contributionCalendar,
      theme,
      event,
      0,
      term,
    );
  }

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
