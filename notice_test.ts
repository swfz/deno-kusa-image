import { assertEquals } from "@std/assert";
import { movedNotice } from "./notice.ts";

Deno.test("movedNotice", async (t) => {
  await t.step("points to the same user on kusa-image.swfz.dev", () => {
    assertEquals(movedNotice("swfz"), "Moved -> kusa-image.swfz.dev/swfz");
  });

  await t.step("keeps the user name as given", () => {
    assertEquals(movedNotice("Octocat"), "Moved -> kusa-image.swfz.dev/Octocat");
  });
});
