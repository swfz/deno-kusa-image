import { assert, assertEquals } from "@std/assert";
import { renderContributions } from "./renderCanvas.ts";
import { backgroundColor, squareColors, textColor } from "./colors.ts";
import type { ContributionCalendar, ContributionDay, Week } from "./contributions.ts";

type RectOp = { kind: "rect"; fillStyle: string; x: number; y: number; w: number; h: number };
type TextOp = { kind: "text"; fillStyle: string; text: string; x: number; y: number };
type Op = RectOp | TextOp;

const makeFakeCtx = () => {
  const ops: Op[] = [];
  let fillStyle = "";
  const ctx = {
    get fillStyle() {
      return fillStyle;
    },
    set fillStyle(v: string) {
      fillStyle = v;
    },
    fillRect(x: number, y: number, w: number, h: number) {
      ops.push({ kind: "rect", fillStyle, x, y, w, h });
    },
    fillText(text: string, x: number, y: number) {
      ops.push({ kind: "text", fillStyle, text, x, y });
    },
  };
  return { ops, ctx: ctx as unknown as CanvasRenderingContext2D };
};

const day = (level: string, date: string): ContributionDay => ({
  color: "",
  contributionCount: 0,
  contributionLevel: level,
  date,
});

const fullWeek = (firstDate: string, levels: string[]): Week => ({
  contributionDays: levels.map((l, i) => {
    const d = new Date(firstDate);
    d.setDate(d.getDate() + i);
    return day(l, d.toISOString().slice(0, 10));
  }),
});

const calendar = (weeks: Week[], total: number): ContributionCalendar => ({
  totalContributions: total,
  colors: [],
  weeks,
});

const WIDTH = 670;
const HEIGHT = 140;
const SPACE = 2;
const SIZE = 10;
const STRIDE = SPACE + SIZE;

Deno.test("renderContributions", async (t) => {
  await t.step("paints the background with backgroundColor(theme) at (0, offset, width, height)", () => {
    const { ops, ctx } = makeFakeCtx();
    renderContributions(ctx, WIDTH, HEIGHT, calendar([], 0), "light", "default", 0);

    const bg = ops[0] as RectOp;
    assertEquals(bg.kind, "rect");
    assertEquals(bg.fillStyle, backgroundColor("light"));
    assertEquals({ x: bg.x, y: bg.y, w: bg.w, h: bg.h }, { x: 0, y: 0, w: WIDTH, h: HEIGHT });
  });

  await t.step("offset shifts background y origin", () => {
    const { ops, ctx } = makeFakeCtx();
    renderContributions(ctx, WIDTH, HEIGHT, calendar([], 0), "dark", "default", 140);

    const bg = ops[0] as RectOp;
    assertEquals(bg.fillStyle, backgroundColor("dark"));
    assertEquals(bg.y, 140);
  });

  await t.step("summary text uses 'the last year' when term is omitted", () => {
    const { ops, ctx } = makeFakeCtx();
    renderContributions(ctx, WIDTH, HEIGHT, calendar([], 123), "light", "default", 0);

    const summary = ops.find((o): o is TextOp => o.kind === "text" && o.text.startsWith("123 contributions"));
    assert(summary, "summary text should exist");
    assertEquals(summary.text, "123 contributions in the last year");
    assertEquals({ x: summary.x, y: summary.y }, { x: 10, y: 10 });
    assertEquals(summary.fillStyle, textColor("light"));
  });

  await t.step("summary text embeds term when provided", () => {
    const { ops, ctx } = makeFakeCtx();
    renderContributions(ctx, WIDTH, HEIGHT, calendar([], 50), "light", "default", 0, "2024-01-01~2024-12-31");

    const summary = ops.find((o): o is TextOp => o.kind === "text" && o.text.startsWith("50 contributions"));
    assertEquals(summary?.text, "50 contributions in 2024-01-01~2024-12-31");
  });

  await t.step("draws Mon/Wed/Fri weekday labels at fixed x=1 with offset applied to y", () => {
    const { ops, ctx } = makeFakeCtx();
    renderContributions(ctx, WIDTH, HEIGHT, calendar([], 0), "light", "default", 200);

    const mon = ops.find((o): o is TextOp => o.kind === "text" && o.text === "Mon");
    const wed = ops.find((o): o is TextOp => o.kind === "text" && o.text === "Wed");
    const fri = ops.find((o): o is TextOp => o.kind === "text" && o.text === "Fri");
    assertEquals({ x: mon?.x, y: mon?.y }, { x: 1, y: 252 });
    assertEquals({ x: wed?.x, y: wed?.y }, { x: 1, y: 274 });
    assertEquals({ x: fri?.x, y: fri?.y }, { x: 1, y: 296 });
  });

  await t.step("each contribution day rect uses squareColors palette and cellStride positioning", () => {
    const palette = squareColors("dark", "halloween");
    const week0 = fullWeek("2024-01-07", [
      "NONE",
      "FIRST_QUARTILE",
      "SECOND_QUARTILE",
      "THIRD_QUARTILE",
      "FOURTH_QUARTILE",
      "NONE",
      "NONE",
    ]);
    const { ops, ctx } = makeFakeCtx();
    renderContributions(ctx, WIDTH, HEIGHT, calendar([week0], 0), "dark", "halloween", 0);

    const dayRects = ops.filter((o): o is RectOp => o.kind === "rect" && o.w === SIZE && o.h === SIZE && o.x === 20);
    assertEquals(dayRects.length, 7);
    assertEquals(dayRects[0].fillStyle, palette.NONE);
    assertEquals(dayRects[1].fillStyle, palette.FIRST_QUARTILE);
    assertEquals(dayRects[4].fillStyle, palette.FOURTH_QUARTILE);
    assertEquals(dayRects[0].y, 30);
    assertEquals(dayRects[1].y, 30 + STRIDE);
    assertEquals(dayRects[6].y, 30 + STRIDE * 6);
  });

  await t.step("first week with fewer than 7 days shifts jIndex by 7 - len", () => {
    const shortWeek: Week = {
      contributionDays: [
        day("FIRST_QUARTILE", "2024-01-05"),
        day("SECOND_QUARTILE", "2024-01-06"),
      ],
    };
    const { ops, ctx } = makeFakeCtx();
    renderContributions(ctx, WIDTH, HEIGHT, calendar([shortWeek], 0), "light", "default", 0);

    const dayRects = ops.filter((o): o is RectOp => o.kind === "rect" && o.w === SIZE && o.h === SIZE && o.x === 20);
    assertEquals(dayRects.length, 2);
    assertEquals(dayRects[0].y, 30 + STRIDE * 5);
    assertEquals(dayRects[1].y, 30 + STRIDE * 6);
  });

  await t.step("subsequent weeks use full j (no compression) and cellStride for x", () => {
    const w0 = fullWeek("2024-01-07", Array(7).fill("NONE"));
    const w1 = fullWeek("2024-01-14", Array(7).fill("NONE"));
    const { ops, ctx } = makeFakeCtx();
    renderContributions(ctx, WIDTH, HEIGHT, calendar([w0, w1], 0), "light", "default", 0);

    const dayRects = ops.filter((o): o is RectOp => o.kind === "rect" && o.w === SIZE && o.h === SIZE);
    const week1Rects = dayRects.filter((r) => r.x === 20 + STRIDE);
    assertEquals(week1Rects.length, 7);
    assertEquals(week1Rects[0].y, 30);
    assertEquals(week1Rects[6].y, 30 + STRIDE * 6);
  });

  await t.step("renders Less/More legend with 5 colored rects from squareColors palette", () => {
    const palette = squareColors("light", "default");
    const { ops, ctx } = makeFakeCtx();
    renderContributions(ctx, WIDTH, HEIGHT, calendar([], 0), "light", "default", 0);

    const less = ops.find((o): o is TextOp => o.kind === "text" && o.text === "Less");
    const more = ops.find((o): o is TextOp => o.kind === "text" && o.text === "More");
    assertEquals({ x: less?.x, y: less?.y }, { x: 500, y: 128 });
    assertEquals({ x: more?.x, y: more?.y }, { x: 595, y: 128 });

    const legendRects = ops.filter((o): o is RectOp =>
      o.kind === "rect" && o.w === SIZE && o.h === SIZE && o.y === 120
    );
    assertEquals(legendRects.length, 5);
    assertEquals(legendRects.map((r) => r.x), [
      530,
      530 + STRIDE,
      530 + STRIDE * 2,
      530 + STRIDE * 3,
      530 + STRIDE * 4,
    ]);
    assertEquals(legendRects.map((r) => r.fillStyle), Object.values(palette));
  });
});
