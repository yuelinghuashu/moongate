<template>
  <div v-if="page">
    <!-- 文章区 -->
    <main class="flex">
      <div class="flex-1 min-w-0">
        <UBadge
          class="mb-4"
          variant="outline"
          :label="`// Update At ${dayjs(page.date).format('YYYY-MM-DD')}`"
        />

        <!-- 文档内容 -->
        <ContentRenderer :value="page" />
      </div>

      <!-- 目录区 -->
      <UDrawer
        v-model:open="isOutlineVisible"
        :direction="isDesktop ? 'right' : 'bottom'"
        title="文章目录"
        description="点击章节快速跳转"
      >
        <template #content>
          <ArticleTableOfContents :outline="page.body.toc?.links" />
        </template>
      </UDrawer>
    </main>
  </div>
  <div v-else><ErrorPage /></div>
</template>

<script lang="ts" setup>
import { withLeadingSlash } from "ufo";
import dayjs from "dayjs";
import { useLocalStorage } from "@vueuse/core";
import useSettingStore from "~/stores/setting";
const { locale, t } = useI18n();
const route = useRoute();
const { isDesktop } = useResponsive();
const settingStore = useSettingStore();

// 核心：移除语言前缀，得到原始路径
// 例如：/en/articles/welcome -> /articles/welcome
const slug = computed(() => {
  const path = withLeadingSlash(String(route.params.slug || "/"));
  // 移除语言前缀部分
  return path.replace(new RegExp(`^/(${locale.value})`), "") || "/";
});

// 稳定查询：永远只查询 'articles' 这个集合
const { data: page } = await useAsyncData(`articles-${slug.value}`, () => {
  return queryCollection("articles").path(`/articles${slug.value}`).first();
});

const isOutlineVisible = useLocalStorage("isOutlineVisible", false);

// 是否显示目录图标
watchEffect(() => {
  settingStore.isOutlineIconVisible =
    page.value?.body.toc?.links && route.path.match(/^\/(articles|about)\/.+/);
});

// 设置 SEO 元信息
if (page.value?.title && page.value?.description) {
  useSeoMeta({
    title: page.value?.title,
    description: page.value?.description,
    ogTitle: page.value?.title,
    ogDescription: page.value?.description,
  });
} else {
  useSeoMeta({
    title: t("title"),
    description: t("description"),
    ogTitle: t("title"),
    ogDescription: t("description"),
  });
}
</script>

<style scoped></style>
