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
        @update:model-value="searchArticleList(articleSearchValue)"
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
          @update:model-value="searchArticleList(articleSearchValue)"
        />
      </ClientOnly>
    </form>

    <!-- 文章预览组件 -->
    <div class="mt-4 mb-8 grid grid-cols-2 gap-2 articles-grid">
      <UBlogPost
        v-for="item in articleList"
        :key="item.id"
        :ui="{ description: 'line-clamp-3' }"
        :title="item.title"
        :description="item.description"
        :date="item.meta.date"
        :to="locale === 'zh_cn' ? item.path : `/${locale}${item.path}`"
        class="card last-of-type:mb-0"
      />
    </div>

    <!-- 分页组件 -->
    <div v-if="isDesktop" class="flex! justify-center items-center">
      <ClientOnly>
        <UPagination
          v-model:page="articlePageination.page"
          :total="articlePageination.total"
          :items-per-page="articlePageination.size"
        />
      </ClientOnly>
      
      <USelect
        v-model="articlePageination.size"
        :items="articlePageination.sizeOptions"
        class="ml-4"
        @update:model-value="handlePageChange()"
      />

      <span
        v-if="articlePageination.total"
        class="ml-4"
        @click="articlePageination.page + 1"
      >
        {{ t("search.findCount", { count: articlePageination.total }) }}
      </span>
    </div>
  </div>

  <div
    v-if="isMobile"
    class="text-center cursor-pointer"
    @click="
      if (hasNextPage) articlePageination.page += 1;
      console.log(hasNextPage);
    "
  >
    加载更多
  </div>
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

const isDev = import.meta.env.DEV;

// 文章搜索框
const articleSearchValue = ref<string>("");

// 文章分页
const articlePageination = ref({
  // 当前页
  page: 1,
  // 每页文章数
  size: 3,
  // 每页文章数选项
  sizeOptions: [3, 5, 8],
  // 文章总数
  total: 0,
});

// 计算总页数
const totalPages = computed(() => {
  const { total, size } = articlePageination.value;
  return Math.ceil(total / size);
});

// 检查是否有上一页/下一页
const hasPrevPage = computed(() => articlePageination.value.page > 1);
const hasNextPage = computed(
  () => articlePageination.value.page < totalPages.value,
);

// 判断是否焦点在某个组件中
const isInputFocused = computed(() => {
  const activeElement = document.activeElement?.tagName;
  return activeElement === "INPUT" || activeElement === "TEXTAREA";
});

// 当每页文章数改变时，重置页码为1
const handlePageChange = () => {
  articlePageination.value.page = 1;
};

// 获取文章列表
const { data: articleList } = await useAsyncData(
  "articles",
  () => {
    return queryCollection("articles")
      .order("meta", "DESC")
      .skip((articlePageination.value.page - 1) * articlePageination.value.size)
      .limit(articlePageination.value.size)
      .all();
  },
  {
    watch: [articlePageination.value],
  },
);

// 搜索文章列表
const searchArticleList = async (keyWord: string) => {
  // 1. 构建基础查询
  let query = queryCollection("articles").order("meta", "DESC");

  // 2. 增加搜索条件(搜索标题/描述)
  // settings.searchOption === 1 仅搜索标题
  // settings.searchOption === 2 搜索标题和描述
  if (keyWord.trim() !== "") {
    if (settings.searchOption === 1) {
      // 仅搜索标题
      query = query.where("title", "LIKE", `%${keyWord}%`);
    } else {
      // 搜索标题和描述
      query = query.orWhere((q) =>
        q
          .where("title", "LIKE", `%${keyWord}%`)
          .where("description", "LIKE", `%${keyWord}%`),
      );
    }
  }

  // 3. 获取总数
  const total = await query.count();
  articlePageination.value.total = total;

  // 4. 应用分页
  query = query
    .skip((articlePageination.value.page - 1) * articlePageination.value.size)
    .limit(articlePageination.value.size);

  // 4. 获取文章列表
  articleList.value = await query.all();
};

// 监听键盘事件，左右方向键翻页
useEventListener("keydown", async (e) => {
  if (isInputFocused.value) return;

  if (e.key === "ArrowLeft" && hasPrevPage.value) {
    e.preventDefault();
    articlePageination.value.page -= 1;
    searchArticleList("");
  } else if (e.key === "ArrowRight" && hasNextPage.value) {
    e.preventDefault();
    articlePageination.value.page += 1;
    searchArticleList("");
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
