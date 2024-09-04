type Event = "default" | "halloween";
type Theme = "dark" | "light";
type ContributionLevel = "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";
type Colors = {
  [key in ContributionLevel]: string;
};
type ColorSet = {
  [key in Theme]: Colors;
};
type AllColors = {
  [key in Event]: ColorSet;
};

const backgroundColor = (theme: string) => {
  return theme === "dark" ? "#000000" : "#FFFFFF";
};

const textColor = (theme: string) => {
  return theme === "dark" ? "#FFFFFF" : "#000000";
};

const squareColors = (theme: string, event: string) => {
  const allColors: AllColors = {
    default: {
      dark: {
        NONE: "#161b22",
        FIRST_QUARTILE: "#0e4429",
        SECOND_QUARTILE: "#006d32",
        THIRD_QUARTILE: "#26a641",
        FOURTH_QUARTILE: "#39d353",
      },
      light: {
        NONE: "#ebedf0",
        FIRST_QUARTILE: "#9be9a8",
        SECOND_QUARTILE: "#40c463",
        THIRD_QUARTILE: "#30a14e",
        FOURTH_QUARTILE: "#216e39",
      },
    },
    halloween: {
      dark: {
        NONE: "#161b22",
        FIRST_QUARTILE: "#631c03",
        SECOND_QUARTILE: "#bd561d",
        THIRD_QUARTILE: "#fa7a18",
        FOURTH_QUARTILE: "#fddf68",
      },
      light: {
        NONE: "#ebedf0",
        FIRST_QUARTILE: "#ffee4a",
        SECOND_QUARTILE: "#ffc501",
        THIRD_QUARTILE: "#fe9600",
        FOURTH_QUARTILE: "#0c001c",
      },
    },
  };
  const colors = allColors[event] ? allColors[event][theme] : allColors.default[theme];

  return colors;
};

export { backgroundColor, squareColors, textColor };
