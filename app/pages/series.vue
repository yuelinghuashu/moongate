<template>
  <Container size="sm" style="padding: 0">
    <div class="text-sm opacity-80 text-center">
      <span> 📖 本博客文章按 P1–P5 分级。P1 为入门，P5 为底层实现。 </span>
      <nuxt-link to="/protocol" class="mg-link">了解详情 →</nuxt-link>
    </div>

    <div class="flex justify-end items-center">
      <Button @click="toggleAll">
        <template #icon>
          <Icon
            :name="
              isAnyExpanded ? 'lucide-chevrons-up' : 'lucide-chevrons-down'
            "
          />
        </template>
      </Button>
    </div>

    <div v-for="series in seriesList" :key="series.slug" class="mb-4">
      <details>
        <summary
          class="flex items-center gap-2 cursor-pointer"
          @click="onSummaryClick"
        >
          <span>{{ series.name }}</span>
          <span class="text-sm text-gray-500">({{ series.docs.length }})</span>
        </summary>
        <div class="pl-4 mt-2 space-y-2">
          <div v-for="article in series.docs" :key="article.id">
            <NuxtLink :to="article.path" class="text-primary">
              {{ article.title }}
            </NuxtLink>
            <div class="text-xs text-gray-500">
              {{ article.level }} · {{ formatDate(article.date) }}
            </div>
          </div>
        </div>
      </details>
    </div>
  </Container>
</template>

<script setup lang="ts">
import { Button, Container } from "moongate-vue";
import dayjs from "dayjs";

const { tm } = useI18nSafe();

// ==================== 数据获取与分组 ====================
const { data: docsList } = await useAsyncData("series", () => {
  return queryCollection("docs")
    .order("date", "ASC")
    .select("id", "series", "title", "level", "path", "seo", "date")
    .all();
});

// 将文档按 series 分组
const seriesMap = computed(() => {
  const map = new Map<string, typeof docsList.value>();
  if (!docsList.value) return map;
  for (const doc of docsList.value) {
    if (!doc.series) continue;
    if (!map.has(doc.series)) map.set(doc.series, []);
    map.get(doc.series)!.push(doc);
  }
  return map;
});

// 系列列表（从 i18n 获取系列名）
const seriesList = computed(() => {
  const seriesObj = tm("series") as Record<string, string>;
  return Object.entries(seriesObj).map(([slug, name]) => ({
    slug,
    name,
    docs: seriesMap.value.get(slug) || [],
  }));
});

// ==================== 折叠/展开所有系列 ====================

// 记录当前是否有任何系列处于展开状态，用于动态切换按钮图标
const isAnyExpanded = ref(false);

/**
 * 更新全局展开状态
 * 直接遍历 DOM 中所有 <details> 元素，检查是否有任一展开
 * 该函数仅在手动点击 summary 时调用，用于同步按钮状态
 */
const updateAnyExpanded = () => {
  const details = document.querySelectorAll("details");
  isAnyExpanded.value = Array.from(details).some((detail) => detail.open);
};

/**
 * 切换所有系列的展开/折叠状态
 * 由右上角按钮触发
 * 1. 根据当前 isAnyExpanded 计算目标状态（全部展开或全部折叠）
 * 2. 批量设置所有 <details> 的 open 属性
 * 3. 直接更新 isAnyExpanded 为目标状态，无需再次查询 DOM
 */
const toggleAll = () => {
  const details = document.querySelectorAll("details");
  const shouldExpand = !isAnyExpanded.value; // 目标状态：当前全部折叠则展开，否则折叠
  details.forEach((detail) => {
    detail.open = shouldExpand;
  });
  // 直接根据本次操作意图设置状态，避免因 toggle 事件干扰而需要两次点击
  isAnyExpanded.value = shouldExpand;
};

/**
 * 用户手动点击 summary（系列标题）时的回调
 * 由于点击后浏览器会异步更新 <details> 的 open 属性，需要延迟到下一轮事件循环再更新状态
 * 确保 DOM 已完全更新后，同步按钮图标
 */
const onSummaryClick = () => {
  setTimeout(() => {
    updateAnyExpanded();
  }, 0);
};

/**
 * 组件挂载后，初始化全局展开状态（页面加载时所有 <details> 默认为折叠）
 */
onMounted(() => {
  updateAnyExpanded();
});

// ==================== 辅助函数 ====================
const formatDate = (date: string) => dayjs(date).format("YYYY-MM-DD");
</script>

<style scoped>
/* 隐藏 details 默认的三角形图标（与 flex 布局无关，确保所有浏览器都隐藏） */
details > summary {
  list-style: none;
}
details > summary::-webkit-details-marker {
  display: none;
}
</style>
