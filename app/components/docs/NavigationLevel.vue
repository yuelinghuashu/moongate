<template>
  <!-- 从 i18n 多语言文件获取等级分类数据：键为等级代码（P1~P5），值为对应的描述文本 -->
  <ul class="flex flex-row justify-between mt-2 text-center">
    <li
      v-for="levelKey in Object.keys(tm('docs.levels'))"
      :key="levelKey"
      class="w-full"
    >
      <NuxtLink
        :to="getLink(levelKey)"
        class="block py-2 nav-link"
        :class="{ active: props.level === levelKey, 'text-sm': isMobile }"
      >
        <!-- 桌面端显示完整描述 -->
        <span class="hidden md:inline"
          >{{ levelKey }} · {{ t(`docs.levels.${levelKey}`) }}</span
        >
        <!-- 移动端只显示等级代码 -->
        <span class="md:hidden">{{ levelKey }}</span>
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup>
import { useLocalStorage } from "@vueuse/core";

const route = useRoute();
const { t } = useI18n();
const { tm } = useI18nSafe();
const { isMobile } = useResponsive();

const props = defineProps({
  level: { type: String, default: "" }, // 默认空字符串，表示无选中
});

const isFilterVisible = useLocalStorage("isFilterVisible", false);

// 生成链接：如果当前等级等于点击的等级，则移除 level 参数；否则添加
const getLink = (item) => {
  const query = { ...route.query };
  if (props.level === item) {
    delete query.level; // 取消选中
  } else {
    query.level = item; // 选中
  }
  // 可选：切换等级时重置页码
  if (query.page) query.page = "1";
  return { query };
};
</script>
