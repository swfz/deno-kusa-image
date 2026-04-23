import type { ContributionCalendar, Week } from "./contributions.ts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const makeMonthLabels = (contribution: ContributionCalendar): string[] => {
  return contribution.weeks.map((week: Week, i: number, array: Week[]) => {
    const isBeginningOfMonth = array[i - 1] === undefined ||
      new Date(week.contributionDays[0].date).getMonth() !==
        new Date(array[i - 1].contributionDays[0].date).getMonth();

    return isBeginningOfMonth ? MONTHS[new Date(week.contributionDays[0].date).getMonth()] : " ";
  });
};

export { makeMonthLabels };
