<template>
  <Container size="sm" style="padding: 0">
    <div class="text-sm opacity-80 text-center">
      <span> 📖 本博客文章按 P1–P5 分级。P1 为入门，P5 为底层实现。 </span>
      <NuxtLink to="/protocol" class="mg-link">了解详情 →</NuxtLink>
    </div>

    <div class="flex justify-end items-center">
      <Button @click="toggleAll">
        <template #icon>
          <Icon
            :name="
              isAnyExpanded ? 'tabler:chevrons-up' : 'tabler:chevrons-down'
            "
          />
        </template>
      </Button>
    </div>

    <div v-for="series in seriesList" :key="series.slug" class="mb-4">
      <div class="border-b" style="border-color: var(--ui-border)">
        <!-- 系列标题：点击切换展开状态 -->
        <button
          type="button"
          class="flex items-center gap-2 cursor-pointer w-full text-left py-2 rounded-sm"
          :aria-expanded="isExpanded(series.slug)"
          @click="toggleSeries(series.slug)"
        >
          <Icon
            :name="
              isExpanded(series.slug)
                ? 'tabler:chevron-down'
                : 'tabler:chevron-right'
            "
            class="flex-shrink-0"
          />
          <span>{{ series.name }}</span>
          <Badge size="sm" color="primary" :label="String(series.docs.length)" />
        </button>

        <!-- 系列文章列表：v-show 保持 DOM 挂载，切换流畅 -->
        <div v-show="isExpanded(series.slug)" class="pl-8 pb-3 space-y-2">
          <div v-for="article in series.docs" :key="article.slug">
            <NuxtLink
              class="text-primary"
              :to="localePath(`/docs/${article.slug}`)"
            >
              {{ article.title }}
            </NuxtLink>
            <div class="text-xs text-gray-500">
              {{ article.level }} · {{ formatDate(article.date) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </Container>
</template>

<script setup lang="ts">
import { Badge, Button, Container } from "moongate-vue";
import dayjs from "dayjs";
import { resolveLangParam } from "~/utils/docs";

const { tm } = useI18nSafe();
const localePath = useLocalePath();

// ==================== 类型定义 ====================
interface SeriesDoc {
  title: string
  date: string
  slug: string
  level: string
}

interface SeriesGroup {
  slug: string
  docs: SeriesDoc[]
}

// ==================== API 调用 ====================
const config = useRuntimeConfig();
const { locale } = useI18n();
const lang = computed(() => resolveLangParam(locale.value));

const { data: seriesData } = await useAsyncData<SeriesGroup[]>(
  computed(() => `series-list-${lang.value}`),
  async () => {
    const query = lang.value ? `&lang=${lang.value}` : '';
    return await $fetch<SeriesGroup[]>(`/api/docs?group=series${query}`, {
      baseURL: config.public.apiUrl,
    });
  },
);

// ==================== 合并 i18n 系列名 ====================
const seriesNames = tm("series") as Record<string, string>;

const seriesList = computed(() => {
  if (!seriesData.value) return [];
  return seriesData.value.map((group: SeriesGroup) => ({
    slug: group.slug,
    name: seriesNames[group.slug] || group.slug,
    docs: group.docs,
  }));
});

// ==================== 折叠/展开所有系列 ====================

// 展开状态：默认全部折叠，确保 SSR 与客户端水合一致
// 不在 useLocalStorage 初始化时读取，避免服务端渲染 chevron-right 而客户端期望 chevron-down
const expandedSeries = ref<string[]>([]);

// 组件挂载后（水合已完成）从 localStorage 恢复用户的展开偏好
onMounted(() => {
  const stored = localStorage.getItem("expandedSeries");
  if (stored) {
    try {
      expandedSeries.value = JSON.parse(stored);
    } catch {
      // 解析失败时忽略，保持折叠状态
    }
  }
});

// 用户切换后持久化到 localStorage
watch(expandedSeries, (val) => {
  localStorage.setItem("expandedSeries", JSON.stringify(val));
});

/** 判断某系列是否展开 */
const isExpanded = (slug: string) => expandedSeries.value.includes(slug);

/** 切换单个系列的展开状态 */
const toggleSeries = (slug: string) => {
  expandedSeries.value = expandedSeries.value.includes(slug)
    ? expandedSeries.value.filter((s) => s !== slug)
    : [...expandedSeries.value, slug];
};

/** 是否有系列处于展开状态（驱动全部展开/折叠按钮图标） */
const isAnyExpanded = computed(() => expandedSeries.value.length > 0);

/** 切换所有系列的展开/折叠状态 */
const toggleAll = () => {
  if (isAnyExpanded.value) {
    expandedSeries.value = [];
  } else {
    expandedSeries.value = seriesList.value.map((s: { slug: string }) => s.slug);
  }
};

// ==================== 辅助函数 ====================
const formatDate = (date: string) => dayjs(date).format("YYYY-MM-DD");
</script>

<style scoped>
/* 移除 button 默认样式，保持与导航链接一致的视觉 */
button[aria-expanded] {
  background: none;
  border: none;
  font: inherit;
  color: inherit;
}

button[aria-expanded]:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
}
</style>