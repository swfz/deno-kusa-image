import { assertEquals, assertExists } from "@std/assert";
import { log } from "./logger.ts";

const collectEntries = async (kv: Deno.Kv) => {
  const entries: Deno.KvEntry<Record<string, unknown>>[] = [];
  for await (const entry of kv.list<Record<string, unknown>>({ prefix: ["logs"] })) {
    entries.push(entry);
  }
  return entries;
};

Deno.test("log", async (t) => {
  await t.step("stores a record with request metadata and additionalData merged", async () => {
    const kv = await Deno.openKv(":memory:");
    try {
      const req = new Request("https://example.com/swfz?theme=dark", {
        method: "GET",
        headers: { "user-agent": "qa" },
      });

      const result = await log(req, { user: "swfz", theme: "dark" }, kv);

      assertExists(result.versionstamp);

      const entries = await collectEntries(kv);
      assertEquals(entries.length, 1);

      const record = entries[0].value;
      assertEquals(record.method, "GET");
      assertEquals(record.url, "https://example.com/swfz?theme=dark");
      assertEquals(record.user, "swfz");
      assertEquals(record.theme, "dark");
      assertEquals((record.headers as Record<string, string>)["user-agent"], "qa");
    } finally {
      kv.close();
    }
  });

  await t.step("stores request body when present", async () => {
    const kv = await Deno.openKv(":memory:");
    try {
      const body = JSON.stringify({ foo: "bar" });
      const req = new Request("https://example.com/api", {
        method: "POST",
        body,
        headers: { "content-type": "application/json" },
      });

      await log(req, {}, kv);

      const entries = await collectEntries(kv);
      assertEquals(entries[0].value.body, body);
    } finally {
      kv.close();
    }
  });

  await t.step("omits body field for requests without body", async () => {
    const kv = await Deno.openKv(":memory:");
    try {
      const req = new Request("https://example.com/", { method: "GET" });

      await log(req, {}, kv);

      const entries = await collectEntries(kv);
      assertEquals("body" in entries[0].value, false);
    } finally {
      kv.close();
    }
  });

  await t.step("uses year/month/day in key path", async () => {
    const kv = await Deno.openKv(":memory:");
    try {
      const req = new Request("https://example.com/");

      await log(req, {}, kv);

      const entries = await collectEntries(kv);
      const [prefix, year, month, day, id] = entries[0].key;
      assertEquals(prefix, "logs");
      const now = new Date();
      assertEquals(year, now.getFullYear());
      assertEquals(month, now.getMonth() + 1);
      assertEquals(day, now.getDate());
      assertEquals(typeof id, "string");
    } finally {
      kv.close();
    }
  });

  await t.step("additionalData overrides request metadata on key collision", async () => {
    const kv = await Deno.openKv(":memory:");
    try {
      const req = new Request("https://example.com/", { method: "GET" });

      await log(req, { method: "OVERRIDDEN" }, kv);

      const entries = await collectEntries(kv);
      assertEquals(entries[0].value.method, "OVERRIDDEN");
    } finally {
      kv.close();
    }
  });
});
