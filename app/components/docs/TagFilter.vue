<template>
  <div>
    <!-- 桌面端提示：Ctrl/Cmd 多选 -->
    <span v-if="isDesktop" class="ml-2 text-xs text-gray-500">
      {{ t("docs.ctrlMultiSelect") }}
    </span>

    <!-- 移动端多选模式开关 -->
    <div v-if="!isDesktop" class="flex justify-end mb-2">
      <button
        type="button"
        class="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300"
        :class="{ 'bg-blue-600 text-white': multiSelectMode }"
        @click="multiSelectMode = !multiSelectMode"
      >
        {{
          multiSelectMode
            ? t("docs.exitMultiSelect")
            : t("docs.multiSelectMode")
        }}
      </button>
    </div>

    <div class="w-full flex flex-wrap">
      <button
        v-for="tag in ALLOWED_TAGS"
        :key="tag"
        type="button"
        class="block p-2 mx-1 nav-link cursor-pointer"
        :class="{ active: isTagSelected(tag) }"
        @click="handleTagClick(tag, $event)"
      >
        <em>#{{ tag }}</em>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ALLOWED_TAGS } from "~/utils/tags";
import { useDocs } from "~/composables/useDocs";
import { useTagsFilter } from "~/composables/useTagsFilter";

const { t } = useI18n();
const { isDesktop, isMobile } = useResponsive();
const multiSelectMode = ref(false);

// 从全局单例获取 tags
const { tags } = useDocs();
const { isTagSelected, handleTagClick: originalHandleTagClick } =
  useTagsFilter(tags);

/**
 * 处理标签点击，支持桌面端 Ctrl/Cmd 多选、移动端多选模式开关
 */
const handleTagClick = (tag, event) => {
  let isMulti = false;

  if (isMobile.value) {
    isMulti = multiSelectMode.value;
  } else {
    isMulti = event.ctrlKey || event.metaKey;
  }

  // 直接传递修改后的修饰符标志
  originalHandleTagClick(tag, {
    ctrlKey: isMulti,
    metaKey: isMulti,
  } as MouseEvent);
};
</script>

<style>
.nav-link.active {
  background-color: var(--ui-primary);
}
</style>
