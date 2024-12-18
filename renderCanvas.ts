import { ContributionCalendar, ContributionDay, Week } from "./contributions.ts";
import { backgroundColor, squareColors, textColor } from "./colors.ts";

const makeMohthLabels = (contribution: ContributionCalendar) => {
  // deno-fmt-ignore
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return contribution.weeks.map(
    (week: Week, i: number, array: Week[]) => {
      const isBeginningOfMonth = array[i - 1] === undefined ||
        new Date(week.contributionDays[0].date).getMonth() !==
          new Date(array[i - 1].contributionDays[0].date).getMonth();

      return isBeginningOfMonth ? months[new Date(week.contributionDays[0].date).getMonth()] : " ";
    },
  );
};

const renderContributions = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  contribution: ContributionCalendar,
  theme: string,
  event: string,
  offset: number,
  term?: string | number,
) => {
  const space = 2;
  const size = 10;

  const monthLabels = makeMohthLabels(contribution);

  ctx.fillStyle = backgroundColor(theme);
  ctx.fillRect(0, 0 + offset, width, height);

  // deno-fmt-ignore
  const summary = `${contribution.totalContributions} contributions in ${term ? term: 'the last year'}`;

  ctx.fillStyle = textColor(theme);
  ctx.fillText(summary, 10, 10 + offset);
  ctx.fillText("Mon", 1, 52 + offset);
  ctx.fillText("Wed", 1, 74 + offset);
  ctx.fillText("Fri", 1, 96 + offset);

  const colors = squareColors(theme, event);

  contribution.weeks.forEach((week: Week, i: number) => {
    ctx.fillStyle = textColor(theme);
    ctx.fillText(monthLabels[i], 20 + (space * i) + (size * i), 25 + offset);

    week.contributionDays.forEach((day: ContributionDay, j: number, arr: ContributionDay[]) => {
      const jIndex = i === 0 ? 7 - arr.length + j : j;
      ctx.fillStyle = colors[day.contributionLevel];
      ctx.fillRect(
        20 + (space * i) + (size * i),
        30 + (space * jIndex) + (size * jIndex) + offset,
        size,
        size,
      );
    });
  });

  const legend = Object.values(squareColors(theme, event)) as string[];

  ctx.fillStyle = textColor(theme);
  ctx.fillText("Less", 500, 128 + offset);
  ctx.fillText("More", 595, 128 + offset);
  legend.forEach((color: string, i: number) => {
    ctx.fillStyle = color;
    ctx.fillRect(530 + (space * i) + (size * i), 120 + offset, size, size);
  });
};

export { renderContributions };
