import { ulid } from "@std/ulid";

const EXPIRE_LOGS_DAYS = 90;

const SENSITIVE_HEADERS = new Set([
  "authorization",
  "proxy-authorization",
  "cookie",
  "set-cookie",
  "x-forwarded-for",
  "x-real-ip",
  "cf-connecting-ip",
  "true-client-ip",
]);

const sanitizeHeaders = (headers: Headers): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [key, value] of headers.entries()) {
    if (!SENSITIVE_HEADERS.has(key.toLowerCase())) {
      result[key] = value;
    }
  }
  return result;
};

type AdditionalData = Record<string, unknown>;

const logObject = async (now: Date, req: Request) => {
  const ts = Math.floor(now.getTime() / 1000);

  return {
    method: req.method,
    url: req.url,
    redirect: req.redirect,
    bodyUsed: req.bodyUsed,
    ...{ ts: ts },
    headers: sanitizeHeaders(req.headers),
    ...(req.body ? { body: await req.text() } : {}),
  };
};

const log = async (request: Request, additionalData: AdditionalData, kv?: Deno.Kv) => {
  const resolvedKv = kv ?? (await Deno.openKv());
  const now = new Date();
  const logRecord = { ...(await logObject(now, request)), ...additionalData };

  return await resolvedKv.set(
    ["logs", now.getFullYear(), now.getMonth() + 1, now.getDate(), ulid()],
    logRecord,
    { expireIn: 1000 * 60 * 60 * 24 * EXPIRE_LOGS_DAYS },
  );
};

export { log };
