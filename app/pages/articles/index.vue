<!-- eslint-disable vue/no-multiple-template-root -->
<template>
  <div>
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

    <!-- 文章总览组件 -->
    <div class="mt-4 mb-8 grid grid-cols-2 grid-rows-2 gap-2 articles-grid">
      <UBlogPost
        v-for="(item, index) in articleList"
        :key="item.id"
        :ui="{ description: 'line-clamp-2' }"
        :title="item.title"
        :description="item.description"
        :date="item.date"
        :to="localePath(item.path)"
        class="card"
        :class="
          articleList.length % 2 !== 0 &&
          index === articleList.length - 1 &&
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
        />
      </ClientOnly>
      <USelect
        v-model="articlePagination.size"
        :items="articlePagination.sizeOptions"
        class="ml-4"
        @update:model-value="articlePagination.page = 1"
      />

      <span class="ml-4">
        {{ t("search.findCount", { count: articleData?.total }) }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import useSettingStore from "~/stores/setting";
import { useEventListener, useScroll } from "@vueuse/core";
import { useSwipeUp } from "~/composables/useSwipeUp";
const { isMobile, isDesktop } = useResponsive();

const { settings } = useSettingStore();
const {  tm, t } = useI18n();
const route = useRoute();
const localePath = useLocalePath();

const { y } = useScroll(window);

const isDev = import.meta.env.DEV;

// 文章搜索框
const articleSearchValue = ref<string>(route.query.search?.toString() || "");

// 文章分页
const articlePagination = ref({
  page: Number(route.query.page) || 1, // 当前页
  size: Number(route.query.size) || 5, // 每页文章数
  sizeOptions: [5, 10, 15, 20], // 每页文章数选项
});

const isLoading = ref(false);

// 判断是否焦点在某个组件中
const isInputFocused = computed(() => {
  const activeElement = document.activeElement?.tagName;
  return activeElement === "INPUT" || activeElement === "TEXTAREA";
});

// 监听窗口滚动，并计算是否接近底部
const isNearBottom = computed(() => {
  const scrollHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;
  // 当滚动到距离页面底部 200 像素以内时，认为接近底部
  return scrollHeight - y.value - viewportHeight < 200;
});

// 获取文章列表
const { data: articleData, refresh } = await useAsyncData(
  "article-list",
  async () => {
    const { page, size } = articlePagination.value;
    const keyword = articleSearchValue.value.trim();
    // 1. 构建基础查询
    let query = queryCollection("articles").order("date", "DESC");

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
    const [total, list] = await Promise.all([
      query.count(),
      query
        .skip((page - 1) * size)
        .limit(size)
        .all(),
    ]);

    return { total, list };
  },
  {
    watch: [articlePagination.value],
  },
);

// 文章列表
const articleList = ref<[]>(articleData.value?.list || []);

// 监听路由变化，更新分页参数
watch(
  () => articleData.value?.list,
  (newValue, oldValue) => {
    if (isMobile.value && articlePagination.value.page !== 1)
      articleList.value = [...oldValue, ...newValue];
    else articleList.value = newValue;
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

// 滑动事件，上滑加载更多文章
const loadMoreArticles = () => {
  // 增加条件：不在加载中、接近底部、是移动端、还有下一页
  if (
    isLoading.value ||
    !isNearBottom.value ||
    !isMobile.value ||
    !hasNextPage.value
  )
    return;

  isLoading.value = true;
  try {
    articlePagination.value.page += 1;
    refresh();
  } catch (error) {
    console.error("加载失败", error);
  } finally {
    isLoading.value = false;
  }
};

// 监听滑动事件
useSwipeUp(loadMoreArticles, { threshold: 60 }); // 阈值可调

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
