import { ContributionCalendar, ContributionDay, Week } from "./contributions.ts";
import { backgroundColor, squareColors, textColor } from "./colors.ts";
import { makeMonthLabels } from "./monthLabels.ts";

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

  const monthLabels = makeMonthLabels(contribution);

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

  const cellStride = space + size;

  contribution.weeks.forEach((week: Week, i: number) => {
    const x = 20 + cellStride * i;
    ctx.fillStyle = textColor(theme);
    ctx.fillText(monthLabels[i], x, 25 + offset);

    week.contributionDays.forEach((day: ContributionDay, j: number, arr: ContributionDay[]) => {
      const jIndex = i === 0 ? 7 - arr.length + j : j;
      ctx.fillStyle = colors[day.contributionLevel];
      ctx.fillRect(x, 30 + cellStride * jIndex + offset, size, size);
    });
  });

  const legend = Object.values(squareColors(theme, event)) as string[];

  ctx.fillStyle = textColor(theme);
  ctx.fillText("Less", 500, 128 + offset);
  ctx.fillText("More", 595, 128 + offset);
  legend.forEach((color: string, i: number) => {
    ctx.fillStyle = color;
    ctx.fillRect(530 + cellStride * i, 120 + offset, size, size);
  });
};

export { renderContributions };
