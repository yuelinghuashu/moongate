import {
  breakpointsTailwind,
  useBreakpoints,
} from "@vueuse/core";

/**
 * 响应式布局判断组合式函数
 * 用于在组件中判断当前设备是桌面端还是移动端
 * 基于 TailwindCSS 的断点系统
 * 
 * @returns 包含设备类型判断的响应式对象
 */
export const useResponsive = () => {
  const breakpoints = useBreakpoints(breakpointsTailwind, { ssrWidth: 768 });

  const isMobile = breakpoints.smaller("md");
  const isDesktop = breakpoints.greaterOrEqual("md");

  return {
    isMobile,
    isDesktop,
  }
}
