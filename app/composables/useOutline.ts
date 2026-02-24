// composables/useOutline.ts
import { useLocalStorage } from "@vueuse/core";

export function useOutline() {

  // 是否显示目录图标
  const isOutlineIconVisible = useLocalStorage("isOutlineIconVisible", false);

  // 是否显示目录
  const isOutlineVisible = useLocalStorage("isOutlineVisible", false);

  // 切换目录图标显示状态
  const toggleIcon = () => {
    isOutlineIconVisible.value = !isOutlineIconVisible.value;
  };

  // 切换目录显示状态
  const toggleOutline = () => {
    isOutlineVisible.value = !isOutlineVisible.value;
  };

  return {
    isOutlineIconVisible,
    isOutlineVisible,
    toggleIcon,
    toggleOutline,
  };
}