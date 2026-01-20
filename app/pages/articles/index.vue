<template>
  <div class="max-w-(--ui-container)">
    <form class="flex items-center search">
      <!-- 搜索组件 -->
      <UInput
        v-model="articleSearchValue"
        icon="i-lucide-search"
        :placeholder="$t('search.placeholder')"
        size="lg"
        @update:model-value="searchArticles()"
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
          class="ml-2"
          @update:model-value="searchArticles()"
        />
      </ClientOnly>
    </form>

    <!-- 文章预览组件 -->
    <div class="mt-4 mb-8">
      <UBlogPost
        v-for="item in articleList"
        :key="item.id"
        :title="item.title"
        :description="item.description"
        :date="item.meta.date"
        class="card cursor-pointer mb-4 last-of-type:mb-0"
        @click="
          navigateTo(locale === 'zh_cn' ? item.path : `/${locale}${item.path}`)
        "
      />
    </div>

    <!-- 分页组件 -->
    <div class="flex items-center">
      <ClientOnly>
        <UPagination
          v-model:page="articlePageination.page"
          :total="articlePageination.total"
          :items-per-page="articlePageination.size"
          @update:page="getArticleList()"
        />
      </ClientOnly>
      <USelect
        v-model="articlePageination.size"
        :items="articlePageination.sizeOptions"
        class="ml-5"
        @update:model-value="handlePageChange()"
      />
      <span class="ml-5">
        {{ $t("search.findCount", { count: articlePageination.total }) }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import useGlobalStore from "~/stores/global";

const { settings } = useGlobalStore();
const { locale, tm } = useI18n();
const isDev = import.meta.env.DEV;

onMounted(() => {
  getArticleList();
});

// 文章列表
const articleList = ref();

// 文章搜索框
const articleSearchValue = ref<string>("");

// 文章分页
const articlePageination = ref({
  // 当前页
  page: 1,
  // 每页文章数
  size: 3,
  // 每页文章数选项
  sizeOptions: [1, 2, 3],
  // 文章总数
  total: 0,
});

// 当每页文章数改变时，重置页码为1
const handlePageChange = () => {
  articlePageination.value.page = 1;
  getArticleList();
};

// 获取文章列表
const getArticleList = async () => {
  // 获取文章总数
  articlePageination.value.total = await queryCollection("articles").count();

  // 获取文章列表
  articleList.value = await queryCollection("articles")
    .skip((articlePageination.value.page - 1) * articlePageination.value.size)
    .limit(articlePageination.value.size)
    .all();

  console.log("articleList", articleList.value);
};

// 搜索文章
const searchArticles = async () => {
  if (articleSearchValue.value.trim() === "") {
    return articleList.value;
  }

  const keyword = articleSearchValue.value.trim();

  if (settings.searchOption === 1) {
    const data = await queryCollection("articles")
      .where("title", "LIKE", `%${keyword}%`)
      .all();
    articleList.value = data;
    articlePageination.value.total = data.length;
  } else {
    const data = await queryCollection("articles")
      .orWhere((query) =>
        query
          .where("title", "LIKE", `%${keyword}%`)
          .where("description", "LIKE", `%${keyword}%`),
      )
      .all();
    articleList.value = data;
    articlePageination.value.total = data.length;
  }
};
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
}
</style>
