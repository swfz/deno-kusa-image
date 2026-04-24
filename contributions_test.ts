import { assert, assertEquals, assertExists } from "@std/assert";
import { getContributions } from "./contributions.ts";

const ORIGINAL_FETCH = globalThis.fetch;

const stubFetch = (responseFactory: () => Response) => {
  const calls: Request[] = [];
  globalThis.fetch = ((input: Request | URL | string, init?: RequestInit) => {
    const req = input instanceof Request ? input : new Request(input.toString(), init);
    calls.push(req);
    return Promise.resolve(responseFactory());
  }) as typeof fetch;
  return {
    calls,
    restore: () => {
      globalThis.fetch = ORIGINAL_FETCH;
    },
  };
};

const okResponse = (payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

const errorResponse = () =>
  new Response(JSON.stringify({ errors: [{ message: "server error" }] }), {
    status: 500,
    headers: { "content-type": "application/json" },
  });

const samplePayload = (totalContributions: number) => ({
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions,
          colors: [],
          isHalloween: false,
          weeks: [],
        },
      },
    },
  },
});

let userCounter = 0;
const uniqueUser = (label: string) => {
  userCounter += 1;
  return `qa-${label}-${userCounter}-${Date.now()}`;
};

Deno.test("getContributions", async (t) => {
  await t.step("issues POST with Authorization header and GraphQL variables", async () => {
    const stub = stubFetch(() => okResponse(samplePayload(1)));
    try {
      const user = uniqueUser("post");
      await getContributions(false, user, "2024-01-01T00:00:00Z", "2024-12-31T23:59:59Z");

      assertEquals(stub.calls.length, 1);
      const req = stub.calls[0];
      assertEquals(req.method, "POST");
      assertEquals(req.headers.get("content-type"), "application/json");
      assert(req.headers.get("Authorization")?.startsWith("Bearer "), "Authorization should be Bearer-prefixed");

      const body = await req.json();
      assertExists(body.query);
      assertEquals(body.variables, {
        user,
        from: "2024-01-01T00:00:00Z",
        to: "2024-12-31T23:59:59Z",
      });
    } finally {
      stub.restore();
    }
  });

  await t.step("returns parsed JSON body from fetch response", async () => {
    const stub = stubFetch(() => okResponse(samplePayload(42)));
    try {
      const result = await getContributions(false, uniqueUser("json"));
      assertEquals(result.data.user.contributionsCollection.contributionCalendar.totalContributions, 42);
    } finally {
      stub.restore();
    }
  });

  await t.step("useCache=true with from+to caches response and skips fetch on second call", async () => {
    const stub = stubFetch(() => okResponse(samplePayload(7)));
    try {
      const user = uniqueUser("cache-hit");
      const from = "2024-01-01T00:00:00Z";
      const to = "2024-12-31T23:59:59Z";

      const first = await getContributions(true, user, from, to);
      const second = await getContributions(true, user, from, to);

      assertEquals(stub.calls.length, 1, "second call should use cache");
      assertEquals(first.data.user.contributionsCollection.contributionCalendar.totalContributions, 7);
      assertEquals(second.data.user.contributionsCollection.contributionCalendar.totalContributions, 7);
    } finally {
      stub.restore();
    }
  });

  await t.step("useCache=false always fetches even when an entry could be cached", async () => {
    const stub = stubFetch(() => okResponse(samplePayload(3)));
    try {
      const user = uniqueUser("nocache");
      const from = "2024-01-01T00:00:00Z";
      const to = "2024-12-31T23:59:59Z";

      await getContributions(false, user, from, to);
      await getContributions(false, user, from, to);

      assertEquals(stub.calls.length, 2);
    } finally {
      stub.restore();
    }
  });

  await t.step("useCache=true but from is undefined → response is NOT cached", async () => {
    const stub = stubFetch(() => okResponse(samplePayload(5)));
    try {
      const user = uniqueUser("no-from");

      await getContributions(true, user, undefined, "2024-12-31T23:59:59Z");
      await getContributions(true, user, undefined, "2024-12-31T23:59:59Z");

      assertEquals(stub.calls.length, 2, "missing 'from' should bypass cache.put");
    } finally {
      stub.restore();
    }
  });

  await t.step("useCache=true but to is undefined → response is NOT cached", async () => {
    const stub = stubFetch(() => okResponse(samplePayload(5)));
    try {
      const user = uniqueUser("no-to");

      await getContributions(true, user, "2024-01-01T00:00:00Z", undefined);
      await getContributions(true, user, "2024-01-01T00:00:00Z", undefined);

      assertEquals(stub.calls.length, 2, "missing 'to' should bypass cache.put");
    } finally {
      stub.restore();
    }
  });

  await t.step("useCache=true but fetch returns non-ok → response is NOT cached", async () => {
    let callCount = 0;
    const stub = stubFetch(() => {
      callCount += 1;
      return callCount === 1 ? errorResponse() : okResponse(samplePayload(9));
    });
    try {
      const user = uniqueUser("err");
      const from = "2024-01-01T00:00:00Z";
      const to = "2024-12-31T23:59:59Z";

      const first = await getContributions(true, user, from, to);
      const second = await getContributions(true, user, from, to);

      assertEquals(stub.calls.length, 2, "non-ok response should bypass cache.put");
      assertExists((first as Record<string, unknown>).errors, "first call returns parsed error body");
      assertEquals(second.data.user.contributionsCollection.contributionCalendar.totalContributions, 9);
    } finally {
      stub.restore();
    }
  });
});
