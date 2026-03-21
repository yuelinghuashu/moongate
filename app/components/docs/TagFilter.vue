<template>
  <div>
    <!-- 桌面端提示 -->
    <span v-if="isDesktop" class="ml-2 text-xs text-gray-500">
      Ctrl+点击多选
    </span>

    <!-- 移动端多选模式开关 -->
    <div v-if="!isDesktop" class="flex justify-end mb-2">
      <button
        class="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300"
        :class="{ 'bg-blue-600 text-white': multiSelectMode }"
        @click="multiSelectMode = !multiSelectMode"
      >
        {{ multiSelectMode ? "退出多选" : "多选模式" }}
      </button>
    </div>

    <div class="w-full flex flex-wrap">
      <NuxtLink
        v-for="tag in ALLOWED_TAGS"
        :key="tag"
        :to="getTagLink(tag)"
        class="block p-2 mx-1 nav-link"
        :class="{ active: isTagSelected(tag) }"
        @click.prevent="onTagClick(tag, $event)"
      >
        <em>#{{ tag }}</em>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ALLOWED_TAGS } from "~/utils/tags";

const { isDesktop, isMobile } = useResponsive();
const multiSelectMode = ref(false);

defineProps({
  getTagLink: { type: Function, required: true },
  isTagSelected: { type: Function, required: true },
});

const emit = defineEmits(["tag-click"]);

const onTagClick = (tag, event) => {
  console.log("--- onTagClick ---");
  console.log("isMobile:", isMobile.value);
  console.log("isDesktop:", isDesktop.value);
  console.log("multiSelectMode.value:", multiSelectMode.value);

  let isMulti = false;

  if (isMobile.value) {
    console.log("进入移动端分支");
    isMulti = multiSelectMode.value;
  } else {
    console.log("进入桌面端分支");
    isMulti = event.ctrlKey || event.metaKey;
  }

  console.log("最终 isMulti:", isMulti);
  emit("tag-click", tag, { ctrlKey: isMulti, metaKey: isMulti });
};
</script>
