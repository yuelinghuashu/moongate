<template>
  <div class="flex flex-col gap-4">
    <Card
      v-for="item in docs"
      :key="item.slug"
      as="li"
      hoverable
      :hide-body="viewMode === 1 ? false : true"
      class="cursor-pointer"
      @click="navigateToDoc(item.slug)"
    >
      <template #header>
        <div
          class="flex flex-col md:flex-row md:justify-between md:items-start gap-2"
        >
          <div class="flex-1">
            <h2 class="text-xl font-medium">{{ item.title }}</h2>
            <div class="flex flex-wrap mt-1">
              <!-- 用 button 而不是 span：卡片本身可点击，标签要能被 Tab 聚焦、回车/空格触发 -->
              <button
                v-for="tag in item.tags"
                :key="tag"
                type="button"
                class="inline-block nav-link text-sm cursor-pointer"
                :class="{ active: isTagSelected(tags, tag) }"
                @click.stop="emit('toggle-tag', tag, isAdditive($event))"
              >
                #{{ tag }}
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <!-- 语言角标：英文界面下回退为中文内容的文章；中文界面下存在英文译文的文章 -->
            <Badge
              v-if="item.isFallback"
              size="sm"
              color="warning"
              :label="t('docs.chineseBadge')"
            />
            <Badge
              v-else-if="item.lang === 'zh' && item.hasTranslation"
              size="sm"
              color="primary"
              :label="t('docs.enBadge')"
            />
            <time
              :datetime="item.date"
              class="text-xs text-ui-text-muted whitespace-nowrap"
            >
              {{ dayjs(item.date).format("YYYY-MM-DD") }}
            </time>
          </div>
        </div>
      </template>
      <template #default>
        <p class="line-clamp-1">{{ item.description }}</p>
      </template>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import { Card, Badge } from "moongate-vue";
import { isTagSelected } from "~/composables/useTagsFilter";
import type { DocItem } from "~/utils/apiTypes";
import dayjs from "dayjs";

// ---------- 定义 Props ----------
// 标签筛选状态由页面经 props 传入（不再从隐式共享单例里取），
// 点击只 emit 意图：写入 URL 的唯一入口是页面上的 useDocs().setFilters。
defineProps<{
  docs: DocItem[];
  viewMode: number;
  tags: string[];
}>();

const emit = defineEmits<{
  "toggle-tag": [tag: string, additive: boolean];
}>();

// ---------- 响应式工具 ----------
const localePath = useLocalePath();
const { t } = useI18n();

// ---------- 交互 ----------
/** 文章卡片上的标签沿用桌面端惯例：Ctrl/Cmd 点击多选 */
const isAdditive = (event: MouseEvent) => event.ctrlKey || event.metaKey;

// ---------- 导航 ----------
const navigateToDoc = (slug: string) => {
  return navigateTo(localePath(`/docs/${slug}`));
};
</script>
