const GITHUB_LAUNCH_YEAR = 2008;

const fixPastYears = (pastYearsParam: string): number => {
  const limit = new Date().getFullYear() - GITHUB_LAUNCH_YEAR + 1;
  const parsed = parseInt(pastYearsParam);
  const num = parsed ? parsed : 1;

  return num > limit ? limit : num;
};

export { fixPastYears, GITHUB_LAUNCH_YEAR };
