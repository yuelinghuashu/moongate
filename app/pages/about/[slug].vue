<template>
  <div v-if="page">
    <main class="flex min-w-0">
      <!-- 文档内容 -->
      <ContentRenderer :value="page" />

      <UDrawer
        v-model:open="isOutlineVisible"
        :direction="isDesktop ? 'right' : 'bottom'"
        :title="t('article.title')"
        :description="t('article.description')"
      >
        <template #content>
          <!-- 大纲目录 -->
          <ArticleTableOfContents :outline="page?.body.toc?.links" />
        </template>
      </UDrawer>
    </main>
  </div>
  <div v-else>
    <ErrorPage />
  </div>
</template>

<script lang="ts" setup>
import { withLeadingSlash } from "ufo";
import { useLocalStorage } from "@vueuse/core";
import useSettingStore from "~/stores/setting";
const route = useRoute();
const { locale, t } = useI18n();
const { isDesktop } = useResponsive();
const settingStore = useSettingStore();

const slug = computed(() => {
  const path = withLeadingSlash(String(route.params.slug || "/"));
  // 移除语言前缀部分
  return path.replace(new RegExp(`^/(${locale.value})`), "") || "/";
});

const { data: page } = await useAsyncData(`about-${slug.value}`, () => {
  return queryCollection("about").path(`/about${slug.value}`).first();
});

console.log("page", page.value);

const isOutlineVisible = useLocalStorage("isOutlineVisible", false);

// 是否显示目录图标
watchEffect(() => {
  settingStore.isOutlineIconVisible = Boolean(
    page.value && page.value?.body.toc?.links,
  );
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
