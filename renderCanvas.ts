import { ContributionCalendar, ContributionDay, Week } from "./contributions.ts";
import { backgroundColor, squareColors, textColor } from "./colors.ts";
import { makeMonthLabels } from "./monthLabels.ts";

// 移転の案内は、テーマによらず赤地に白の太字で描いて目立たせる
const NOTICE_BACKGROUND = "#cf222e";
const NOTICE_TEXT = "#ffffff";
const NOTICE_PADDING = 4;

const renderNotice = (ctx: CanvasRenderingContext2D, notice: string, offset: number) => {
  const font = ctx.font;
  ctx.font = `bold ${font}`;
  const width = ctx.measureText(notice).width;

  ctx.fillStyle = NOTICE_BACKGROUND;
  ctx.fillRect(10 - NOTICE_PADDING, 117 + offset, width + NOTICE_PADDING * 2, 15);
  ctx.fillStyle = NOTICE_TEXT;
  ctx.fillText(notice, 10, 128 + offset);

  ctx.font = font;
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
  notice?: string,
) => {
  const space = 2;
  const size = 10;

  const monthLabels = makeMonthLabels(contribution);

  ctx.fillStyle = backgroundColor(theme);
  ctx.fillRect(0, 0 + offset, width, height);

  const maxCount = contribution.weeks.reduce(
    (acc, week) => week.contributionDays.reduce((a, d) => Math.max(a, d.contributionCount), acc),
    0,
  );

  // deno-fmt-ignore
  const summary = `${contribution.totalContributions} contributions in ${term ? term: 'the last year'} (max ${maxCount}/day)`;

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
      ctx.fillStyle = (colors as Record<string, string>)[day.contributionLevel];
      ctx.fillRect(x, 30 + cellStride * jIndex + offset, size, size);
    });
  });

  if (notice) {
    renderNotice(ctx, notice, offset);
  }

  const legend = Object.values(squareColors(theme, event)) as string[];

  ctx.fillStyle = textColor(theme);
  ctx.fillText("Less", 500, 128 + offset);
  ctx.fillText("More", 595, 128 + offset);
  legend.forEach((color: string, i: number) => {
    ctx.fillStyle = color;
    ctx.fillRect(530 + cellStride * i, 120 + offset, size, size);
  });
};

export { NOTICE_BACKGROUND, NOTICE_TEXT, renderContributions };
