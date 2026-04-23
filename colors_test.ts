import { assertEquals } from "@std/assert";
import { backgroundColor, squareColors, textColor } from "./colors.ts";

Deno.test("backgroundColor", async (t) => {
  await t.step("dark theme returns black", () => {
    assertEquals(backgroundColor("dark"), "#000000");
  });
  await t.step("light theme returns white", () => {
    assertEquals(backgroundColor("light"), "#FFFFFF");
  });
  await t.step("unknown theme falls back to white", () => {
    assertEquals(backgroundColor("neon"), "#FFFFFF");
  });
});

Deno.test("textColor", async (t) => {
  await t.step("dark theme returns white", () => {
    assertEquals(textColor("dark"), "#FFFFFF");
  });
  await t.step("light theme returns black", () => {
    assertEquals(textColor("light"), "#000000");
  });
  await t.step("unknown theme falls back to black", () => {
    assertEquals(textColor("neon"), "#000000");
  });
});

Deno.test("squareColors", async (t) => {
  await t.step("default dark palette", () => {
    assertEquals(squareColors("dark", "default"), {
      NONE: "#161b22",
      FIRST_QUARTILE: "#0e4429",
      SECOND_QUARTILE: "#006d32",
      THIRD_QUARTILE: "#26a641",
      FOURTH_QUARTILE: "#39d353",
    });
  });
  await t.step("default light palette", () => {
    assertEquals(squareColors("light", "default"), {
      NONE: "#ebedf0",
      FIRST_QUARTILE: "#9be9a8",
      SECOND_QUARTILE: "#40c463",
      THIRD_QUARTILE: "#30a14e",
      FOURTH_QUARTILE: "#216e39",
    });
  });
  await t.step("halloween dark palette", () => {
    assertEquals(squareColors("dark", "halloween"), {
      NONE: "#161b22",
      FIRST_QUARTILE: "#631c03",
      SECOND_QUARTILE: "#bd561d",
      THIRD_QUARTILE: "#fa7a18",
      FOURTH_QUARTILE: "#fddf68",
    });
  });
  await t.step("halloween light palette", () => {
    assertEquals(squareColors("light", "halloween"), {
      NONE: "#ebedf0",
      FIRST_QUARTILE: "#ffee4a",
      SECOND_QUARTILE: "#ffc501",
      THIRD_QUARTILE: "#fe9600",
      FOURTH_QUARTILE: "#0c001c",
    });
  });
  await t.step("unknown event falls back to default palette (dark)", () => {
    assertEquals(squareColors("dark", "xmas"), squareColors("dark", "default"));
  });
  await t.step("unknown event falls back to default palette (light)", () => {
    assertEquals(squareColors("light", "xmas"), squareColors("light", "default"));
  });
});
