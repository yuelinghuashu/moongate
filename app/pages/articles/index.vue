<!-- eslint-disable vue/no-multiple-template-root -->
<template>
  <div class="max-w-(--ui-container)">
    <form class="flex items-center justify-between search">
      <!-- 搜索组件 -->
      <UInput
        v-model="articleSearchValue"
        icon="i-lucide-search"
        :placeholder="$t('search.placeholder')"
        size="lg"
        class="w-full"
        @update:model-value="refresh()"
      >
        <template v-if="articleSearchValue?.length" #trailing>
          <UButton
            color="neutral"
            variant="link"
            icon="i-lucide-circle-x"
            aria-label="Clear input"
            @click="articleSearchValue = ''"
          />
        </template>
      </UInput>

      <!-- 文章搜索选项 -->
      <ClientOnly>
        <USelect
          v-model="settings.searchOption"
          :items="tm('search.options')"
          :label-key="isDev ? 'name.loc.source' : 'name'"
          value-key="id"
          size="lg"
          placeholder="搜索选项"
          class="ml-2 min-w-50"
        />
      </ClientOnly>
    </form>

    <!-- 文章预览组件 -->
    <div class="mt-4 mb-8 grid grid-cols-2 grid-rows-2 gap-2 articles-grid">
      <UBlogPost
        v-for="(item, index) in articleData?.articleList"
        :key="item.id"
        :ui="{ description: 'line-clamp-3' }"
        :title="item.title"
        :description="item.description"
        :date="item.meta.date"
        :to="locale === 'zh_cn' ? item.path : `/${locale}${item.path}`"
        class="card"
        :class="
          articleData.articleList.length % 2 !== 0 &&
          index === articleData.articleList.length - 1 &&
          isDesktop
            ? 'col-span-2'
            : ''
        "
      />
    </div>

    <!-- 分页组件 -->
    <div v-if="isDesktop" class="flex justify-center items-center">
      <ClientOnly>
        <UPagination
          v-model:page="articlePagination.page"
          :total="articleData?.total"
          :items-per-page="articlePagination.size"
          @update:page="refresh()"
        />
      </ClientOnly>
      <USelect
        v-model="articlePagination.size"
        :items="articlePagination.sizeOptions"
        class="ml-4"
      />

      <span class="ml-4">
        {{ t("search.findCount", { count: articleData?.total }) }}
      </span>
    </div>
  </div>

  <div v-if="isMobile" class="text-center cursor-pointer">加载更多</div>
</template>

<script lang="ts" setup>
import useGlobalStore from "~/stores/global";
import {
  useEventListener,
  breakpointsTailwind,
  useBreakpoints,
} from "@vueuse/core";

const { settings } = useGlobalStore();
const { locale, tm, t } = useI18n();
const breakpoints = useBreakpoints(breakpointsTailwind, { ssrWidth: 768 });
const isMobile = breakpoints.smaller("md");
const isDesktop = breakpoints.greaterOrEqual("md");
const route = useRoute();
const isDev = import.meta.env.DEV;

console.log(route.query);

// 文章搜索框
const articleSearchValue = ref<string>(route.query.search?.toString() || "");

// 文章分页
const articlePagination = ref({
  page: Number(route.query.page) || 1, // 当前页
  size: Number(route.query.size) || 5, // 每页文章数
  sizeOptions: [5, 10, 15, 20], // 每页文章数选项
});

// 判断是否焦点在某个组件中
const isInputFocused = computed(() => {
  const activeElement = document.activeElement?.tagName;
  return activeElement === "INPUT" || activeElement === "TEXTAREA";
});

// 获取文章列表
const { data: articleData, refresh } = await useAsyncData(
  "article-list",
  async () => {
    const { page, size } = articlePagination.value;
    const keyword = articleSearchValue.value.trim();
    // 1. 构建基础查询
    let query = queryCollection("articles").order("meta", "DESC");

    // 2. 增加搜索条件(搜索标题/描述)
    // settings.searchOption === 1 仅搜索标题
    // settings.searchOption === 2 搜索标题和描述
    if (keyword !== "") {
      if (settings.searchOption === 1) {
        // 仅搜索标题
        query = query.where("title", "LIKE", `%${keyword}%`);
      } else {
        // 搜索标题和描述
        query = query.orWhere((q) =>
          q
            .where("title", "LIKE", `%${keyword}%`)
            .where("description", "LIKE", `%${keyword}%`),
        );
      }
    }

    // 3. 获取总数和列表
    const [total, articleList] = await Promise.all([
      query.count(),
      query
        .skip((page - 1) * size)
        .limit(size)
        .all(),
    ]);

    return { total, articleList };
  },
  {
    watch: [articlePagination],
  },
);

// 计算总页数
const totalPages = computed(() => {
  const { size } = articlePagination.value;
  return Math.ceil(articleData.value.total / size);
});

// 检查是否有上一页/下一页
const hasPrevPage = computed(() => articlePagination.value.page > 1);
const hasNextPage = computed(
  () => articlePagination.value.page < totalPages.value,
);

// 监听键盘事件，左右方向键翻页
useEventListener("keydown", (e) => {
  if (isInputFocused.value) return;

  if (e.key === "ArrowLeft" && hasPrevPage.value) {
    e.preventDefault();
    articlePagination.value.page -= 1;
    refresh();
  } else if (e.key === "ArrowRight" && hasNextPage.value) {
    e.preventDefault();
    articlePagination.value.page += 1;
    refresh();
  }
});
</script>

<style scoped>
@media (max-width: 768px) {
  :deep(.text-muted) {
    display: none;
  }
  .search {
    flex-direction: column;
  }
  .search > div {
    margin-bottom: 10px;
  }
  .search > * {
    width: 100%;
    margin-left: 0;
  }

  .articles-grid {
    grid-template-columns: none;
  }
}
</style>
