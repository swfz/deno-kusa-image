import { assertEquals } from "@std/assert";
import { makeMonthLabels } from "./monthLabels.ts";
import type { ContributionCalendar, Week } from "./contributions.ts";

const weekFromFirstDate = (firstDate: string): Week => ({
  contributionDays: [
    { color: "", contributionCount: 0, contributionLevel: "NONE", date: firstDate },
  ],
});

const calendar = (firstDates: string[]): ContributionCalendar => ({
  totalContributions: 0,
  colors: [],
  weeks: firstDates.map(weekFromFirstDate),
});

Deno.test("makeMonthLabels", async (t) => {
  await t.step("empty weeks returns empty array", () => {
    assertEquals(makeMonthLabels(calendar([])), []);
  });

  await t.step("first week always gets its month label", () => {
    assertEquals(makeMonthLabels(calendar(["2024-03-15"])), ["Mar"]);
  });

  await t.step("consecutive weeks in same month -> label only on first", () => {
    assertEquals(
      makeMonthLabels(calendar(["2024-03-08", "2024-03-15", "2024-03-22"])),
      ["Mar", " ", " "],
    );
  });

  await t.step("month boundary emits new label", () => {
    assertEquals(
      makeMonthLabels(calendar(["2024-03-22", "2024-03-29", "2024-04-12"])),
      ["Mar", " ", "Apr"],
    );
  });

  await t.step("year boundary (Dec -> Jan) emits January label", () => {
    assertEquals(
      makeMonthLabels(calendar(["2023-12-15", "2023-12-22", "2024-01-12"])),
      ["Dec", " ", "Jan"],
    );
  });

  await t.step("same month number across years is treated as no transition (getMonth-only compare)", () => {
    assertEquals(
      makeMonthLabels(calendar(["2023-03-15", "2024-03-15"])),
      ["Mar", " "],
    );
  });
});
