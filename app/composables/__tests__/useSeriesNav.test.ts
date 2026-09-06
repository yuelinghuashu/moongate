import { describe, it, expect } from "vitest";
import {
  buildSeriesNavModel,
  type SeriesGroup,
} from "../useSeriesNav";

// 构造一个分组数据（模拟 API 返回，已按阅读顺序排好）
const groups: SeriesGroup[] = [
  {
    slug: "narrative-engine",
    docs: [
      { slug: "part-1", title: "Part 1", description: "", series: "narrative-engine", date: "2026-07-20", tags: [] },
      { slug: "part-2", title: "Part 2", description: "", series: "narrative-engine", date: "2026-07-20", tags: [] },
      { slug: "part-3", title: "Part 3", description: "", series: "narrative-engine", date: "2026-07-20", tags: [] },
    ],
  },
  {
    slug: "other",
    docs: [
      { slug: "x", title: "X", description: "", series: "other", date: "2026-01-01", tags: [] },
    ],
  },
];

const names: Record<string, string> = {
  "narrative-engine": "叙事引擎",
};

const toHref = (slug: string) => `/docs/${slug}`;

describe("buildSeriesNavModel", () => {
  it("无系列 slug 返回空且 hasSeries=false", () => {
    const r = buildSeriesNavModel(groups, null, "part-1", names, toHref);
    expect(r.hasSeries).toBe(false);
    expect(r.items).toEqual([]);
    expect(r.title).toBe("");
  });

  it("系列不存在于分组时返回空（hasSeries 仍反映有系列）", () => {
    const r = buildSeriesNavModel(groups, "not-exist", "part-1", names, toHref);
    expect(r.hasSeries).toBe(true);
    expect(r.items).toEqual([]);
  });

  it("按分组顺序映射 items（不排序，保持后端顺序）", () => {
    const r = buildSeriesNavModel(groups, "narrative-engine", "part-2", names, toHref);
    expect(r.hasSeries).toBe(true);
    expect(r.items.map((i) => i.key)).toEqual(["part-1", "part-2", "part-3"]);
    expect(r.items.map((i) => i.label)).toEqual(["Part 1", "Part 2", "Part 3"]);
    expect(r.items.map((i) => i.href)).toEqual([
      "/docs/part-1",
      "/docs/part-2",
      "/docs/part-3",
    ]);
  });

  it("标题使用局部化系列名，缺失时回退 slug", () => {
    const localized = buildSeriesNavModel(groups, "narrative-engine", "part-1", names, toHref);
    expect(localized.title).toBe("叙事引擎");

    const fallback = buildSeriesNavModel(groups, "other", "x", names, toHref);
    expect(fallback.title).toBe("other");
  });

  it("active 始终等于当前文档 slug", () => {
    const r = buildSeriesNavModel(groups, "narrative-engine", "part-3", names, toHref);
    expect(r.active).toBe("part-3");
  });
});
