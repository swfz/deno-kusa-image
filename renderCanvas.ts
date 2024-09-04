import { ContributionCalendar, ContributionDay, Week } from "./contributions.ts";

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

const darkModeColors = {
  NONE: "#161b22",
  FIRST_QUARTILE: "#0e4429",
  SECOND_QUARTILE: "#006d32",
  THIRD_QUARTILE: "#26a641",
  FOURTH_QUARTILE: "#39d353",
};

const renderContributions = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  contribution: ContributionCalendar,
  theme: string,
) => {
  const space = 2;
  const size = 10;

  const monthLabels = makeMohthLabels(contribution);

  ctx.fillStyle = theme === "dark" ? "#000000" : "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // deno-fmt-ignore
  ctx.fillText(`${contribution.totalContributions} contributions in the last year`, 10, 10);
  ctx.fillText("Mon", 1, 52);
  ctx.fillText("Wed", 1, 74);
  ctx.fillText("Fri", 1, 96);

  contribution.weeks.forEach((week: Week, i: number) => {
    ctx.fillStyle = theme === "dark" ? "white" : "black";
    ctx.fillText(monthLabels[i], 20 + (space * i) + (size * i), 25);

    week.contributionDays.forEach((day: ContributionDay, j: number) => {
      ctx.fillStyle = theme === "dark" ? darkModeColors[day.contributionLevel] : day.color;
      ctx.fillRect(
        20 + (space * i) + (size * i),
        30 + (space * j) + (size * j),
        size,
        size,
      );
    });
  });

  const legend = theme === "dark" ? Object.values(darkModeColors) : ["#ebedf0", ...contribution.colors];

  ctx.fillStyle = theme === "dark" ? "white" : "black";
  ctx.fillText("Less", 500, 128);
  ctx.fillText("More", 595, 128);
  legend.forEach((color: string, i: number) => {
    ctx.fillStyle = color;
    ctx.fillRect(530 + (space * i) + (size * i), 120, size, size);
  });
};

export { renderContributions };
