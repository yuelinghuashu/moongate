<template>
  <ul class="flex flex-row justify-between mt-2 text-center">
    <li v-for="item in levelOptions" :key="item" class="w-full">
      <NuxtLink
        :to="getLink(item)"
        class="block py-2 nav-link"
        :class="{ active: level === item }"
      >
        {{ item }}
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup>
const route = useRoute();
const levelOptions = ["P1", "P2", "P3", "P4", "P5"];

const props = defineProps({
  level: { type: String, default: "" }, // 默认空字符串，表示无选中
});

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
