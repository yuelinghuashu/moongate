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
          <div v-for="article in series.docs" :key="article.slug">
            <NuxtLink  class="text-primary" :to="localePath(`/docs/${article.slug}`)">
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
const localePath = useLocalePath()

// ==================== 类型定义 ====================
interface SeriesDoc {
  title: string
  date: string
  permalink: string
  slug: string
  level: string
}

interface SeriesGroup {
  slug: string
  docs: SeriesDoc[]
}

// ==================== API 调用 ====================
const config = useRuntimeConfig()

const { data: seriesData } = await useAsyncData<SeriesGroup[]>(
  'series-list',
  async () => {
    return await $fetch<SeriesGroup[]>(`/api/docs?group=series`, {
      baseURL: config.public.apiUrl
    })
  }
)

// ==================== 合并 i18n 系列名 ====================
const seriesNames = tm('series') as Record<string, string>

const seriesList = computed(() => {
  if (!seriesData.value) return []
  return seriesData.value.map(group => ({
    slug: group.slug,
    name: seriesNames[group.slug] || group.slug,
    docs: group.docs
  }))
})

// ==================== 折叠/展开所有系列 ====================

// 记录当前是否有任何系列处于展开状态，用于动态切换按钮图标
const isAnyExpanded = ref(false);

/**
 * 更新全局展开状态
 * 直接遍历 DOM 中所有 <details> 元素，检查是否有任一展开
 * 该函数仅在手动点击 summary 时调用，用于同步按钮状态
 */
const updateAnyExpanded = () => {
  // 只在客户端执行
  if (typeof document === 'undefined') return
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
