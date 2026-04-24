import { assertEquals } from "@std/assert";
import { fixPastYears, GITHUB_LAUNCH_YEAR } from "./pastYears.ts";

const upperLimit = new Date().getFullYear() - GITHUB_LAUNCH_YEAR + 1;

Deno.test("fixPastYears", async (t) => {
  await t.step('valid numeric string "3" returns 3', () => {
    assertEquals(fixPastYears("3"), 3);
  });

  await t.step('"1" returns 1', () => {
    assertEquals(fixPastYears("1"), 1);
  });

  await t.step("empty string falls back to 1 (parseInt NaN)", () => {
    assertEquals(fixPastYears(""), 1);
  });

  await t.step("non-numeric string falls back to 1 (parseInt NaN)", () => {
    assertEquals(fixPastYears("abc"), 1);
  });

  await t.step('"0" falls back to 1 (parseInt result is falsy)', () => {
    assertEquals(fixPastYears("0"), 1);
  });

  await t.step('trailing non-digits are ignored ("5abc" -> 5)', () => {
    assertEquals(fixPastYears("5abc"), 5);
  });

  await t.step("values above the current-year limit are clamped", () => {
    assertEquals(fixPastYears("999"), upperLimit);
  });

  await t.step("value equal to the limit passes through", () => {
    assertEquals(fixPastYears(String(upperLimit)), upperLimit);
  });
});
