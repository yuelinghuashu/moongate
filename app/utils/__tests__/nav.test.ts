import { describe, it, expect } from "vitest";
import { isNavLinkActive } from "../nav";

describe("isNavLinkActive（路径段边界匹配）", () => {
  it("精确命中：当前路径等于导航项链接", () => {
    expect(isNavLinkActive("/series", "/series")).toBe(true);
    expect(isNavLinkActive("/docs", "/docs")).toBe(true);
  });

  it("子路径命中：位于导航项前缀的下一路径段内", () => {
    expect(isNavLinkActive("/docs", "/docs/series-collapse-with-details")).toBe(true);
    expect(isNavLinkActive("/series", "/series/gin-gorm")).toBe(true);
    expect(isNavLinkActive("/en/docs", "/en/docs/hello-world")).toBe(true);
  });

  it("修复回归：前缀词相同的不同路径段不再误高亮", () => {
    // 导航「系列」=/series，文章 slug 含 series 前缀但并非 /series 子路径
    expect(isNavLinkActive("/series", "/docs/series-collapse-with-details")).toBe(false);
    // 同理其它同前缀词场景
    expect(isNavLinkActive("/about", "/about-the-project")).toBe(false);
    expect(isNavLinkActive("/projects", "/docs/projects-intro")).toBe(false);
  });

  it("末位斜杠可忽略：/docs/ 与 /docs 等价", () => {
    expect(isNavLinkActive("/docs/", "/docs/foo")).toBe(true);
    expect(isNavLinkActive("/docs", "/docs/")).toBe(true);
  });

  it("首页：仅精确匹配根路径", () => {
    expect(isNavLinkActive("/", "/")).toBe(true);
    expect(isNavLinkActive("/", "/docs")).toBe(false);
  });

  it("兄弟路径不命中", () => {
    expect(isNavLinkActive("/docs", "/about")).toBe(false);
    expect(isNavLinkActive("/series", "/seriesx")).toBe(false);
  });
});
