import {
  breakpointsTailwind,
  useBreakpoints,
} from "@vueuse/core";

// 判断当前设备是桌面端还是移动端
export const useResponsive = () => {
  const breakpoints = useBreakpoints(breakpointsTailwind, { ssrWidth: 768 });

  const isMobile = breakpoints.smaller("md");
  const isDesktop = breakpoints.greaterOrEqual("md");

  return {
    isMobile,
    isDesktop,
  }
}
