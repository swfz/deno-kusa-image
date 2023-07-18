import { createCanvas } from "https://deno.land/x/canvas/mod.ts";
import { serve } from "https://deno.land/std@0.194.0/http/server.ts";

const getContributions = async (user: string) => {
  const token = Deno.env.get("GH_READ_USER_TOKEN");
  const query = `
    query($user:String!) {
      user(login: $user){
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                color
                contributionCount
                contributionLevel
                date
              }
            }
          }
        }
      }
    }
  `;

  const variables = { user };
  const json = { query, variables };
  const url = "https://api.github.com/graphql";
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(json),
  });

  return res.json();
};

const port = 8080;
const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const user = url.searchParams.get("user");

  // const decoder = new TextDecoder("utf-8");
  // const file = await Deno.readFile("contributions.json");
  // const data = JSON.parse(decoder.decode(file));
  const data = await getContributions(user!);

  const canvas = createCanvas(670, 130);
  const ctx = canvas.getContext("2d");
  const space = 2;
  const size = 10;

  if (data?.data?.user !== null) {
    const contribution =
      data.data.user.contributionsCollection.contributionCalendar;

    // deno-fmt-ignore
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Otc", "Nov", "Dec"];
    const monthLabels = contribution.weeks.map(
      (week: any, i: number, array: any) => {
        const isBeginningOfMonth = array[i - 1] === undefined ||
          new Date(week.contributionDays[0].date).getMonth() !==
            new Date(array[i - 1].contributionDays[0].date).getMonth();

        return isBeginningOfMonth
          ? months[new Date(week.contributionDays[0].date).getMonth()]
          : " ";
      },
    );

    // deno-fmt-ignore
    ctx.fillText(`${contribution.totalContributions} contributions in the last year`, 10, 10);
    ctx.fillText("Mon", 1, 52);
    ctx.fillText("Wed", 1, 74);
    ctx.fillText("Fri", 1, 96);

    contribution.weeks.forEach((week: any, i: number) => {
      ctx.fillStyle = "black";
      ctx.fillText(monthLabels[i], 20 + (space * i) + (size * i), 25);

      week.contributionDays.forEach((day: any, j: number) => {
        ctx.fillStyle = day.color;
        ctx.fillRect(
          20 + (space * i) + (size * i),
          30 + (space * j) + (size * j),
          size,
          size,
        );
      });
    });
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
