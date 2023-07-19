import { createCanvas, serve } from "./deps.ts";

interface ContributionDay {
  color: string;
  contributionCount: number;
  contributionLevel: string;
  date: string;
}

interface Week {
  contributionDays: ContributionDay[];
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: Week[];
}

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

  const canvas = createCanvas(670, 140);
  const ctx = canvas.getContext("2d");
  const space = 2;
  const size = 10;

  if (data?.data?.user !== null) {
    const contribution =
      data.data.user.contributionsCollection.contributionCalendar;

    // deno-fmt-ignore
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Otc", "Nov", "Dec"];
    const monthLabels = contribution.weeks.map(
      (week: Week, i: number, array: Week[]) => {
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

    contribution.weeks.forEach((week: Week, i: number) => {
      ctx.fillStyle = "black";
      ctx.fillText(monthLabels[i], 20 + (space * i) + (size * i), 25);

      week.contributionDays.forEach((day: ContributionDay, j: number) => {
        ctx.fillStyle = day.color;
        ctx.fillRect(
          20 + (space * i) + (size * i),
          30 + (space * j) + (size * j),
          size,
          size,
        );
      });
    });

    const legend = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
    ctx.fillStyle = "black";
    ctx.fillText("Less", 500, 128);
    ctx.fillText("More", 595, 128);
    legend.forEach((color: string, i: number) => {
      ctx.fillStyle = color;
      ctx.fillRect(530 + (space * i) + (size * i), 120, size, size);
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