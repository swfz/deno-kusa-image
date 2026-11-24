import { assertEquals } from "@std/assert";
import { MOVED_NOTICE } from "./notice.ts";

Deno.test("MOVED_NOTICE tells the new host and that the old host will stop", () => {
  assertEquals(MOVED_NOTICE, "Moved to kusa-image.swfz.dev. kusa-image.swfz.deno.net will stop working soon");
});
