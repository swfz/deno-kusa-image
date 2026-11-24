import { assertEquals } from "@std/assert";
import { MOVED_NOTICE } from "./notice.ts";

Deno.test("MOVED_NOTICE points from the old host to the new host", () => {
  assertEquals(MOVED_NOTICE, "kusa-image.swfz.deno.net -> kusa-image.swfz.dev");
});
