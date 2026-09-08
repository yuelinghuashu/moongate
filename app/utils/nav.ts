/**
 * 导航激活判定（路径段边界匹配）。
 *
 * 修复：旧实现用 `route.fullPath.includes(item.link)` 子串匹配——
 * 导航项「系列」link 为 `/series`，打开 `/docs/series-collapse-with-details` 时
 * 路径含 `series` 子串导致误高亮；同理 `/docs/xxx`、`/about-xxx` 等 slug 都会串扰。
 * 改为「路径 === 项前缀 或 位于项前缀的下一路径段」的边界匹配。
 *
 * @param navHref - 导航项最终链接（已含语言前缀，如 `/en/docs`）
 * @param currentPath - 当前路由路径（route.path，不含 query/hash）
 * @returns 是否应高亮
 */
export function isNavLinkActive(navHref: string, currentPath: string): boolean {
  // 统一去除末尾斜杠；根路径 "/" 归一为空串
  const base = navHref.replace(/\/+$/, "")

  if (base === "") {
    // 首页链接：仅精确匹配根路径
    return currentPath === "/"
  }
  // 精确命中，或命中其子路径段（base + "/" 保证段边界，避免前缀词误匹配）
  return currentPath === base || currentPath.startsWith(base + "/")
}
