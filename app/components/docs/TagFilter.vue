<template>
  <Card class="mb-5">
    <template #header>
      <!-- 桌面端提示：Ctrl/Cmd 多选 -->
      <span v-if="isDesktop" class="text-xs" style="color: var(--ui-text-muted)">
        {{ t("docs.ctrlMultiSelect") }}
      </span>

      <!-- 移动端多选模式开关 -->
      <div v-if="!isDesktop">
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
    </template>

    <!-- 按分组渲染标签 -->
    <div v-for="(group, index) in TAG_GROUPS" :key="group.key">
      <Divider v-if="index > 0" />
      <h4
        class="text-xs font-semibold uppercase tracking-wide mb-2"
        style="color: var(--ui-text-muted)"
      >
        {{ t(`docs.tagGroups.${group.key}`) }}
      </h4>
      <div class="w-full flex flex-wrap">
        <button
          v-for="tag in group.tags"
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
  </Card>
</template>

<script lang="ts" setup>
import { Card, Divider } from "moongate-vue";
import { TAG_GROUPS } from "~/utils/tags";
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
const handleTagClick = (tag: string, event: MouseEvent) => {
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
