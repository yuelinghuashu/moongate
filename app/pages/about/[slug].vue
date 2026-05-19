<template>
  <div v-if="page">
    <!-- 文档内容 -->
    <article
      class="prose prose-sm dark:prose-invert max-w-none md:prose-base lg:prose-lg p-4 md:p-6 lg:p-8"
    >
      <ContentRenderer :value="page" />
    </article>

    <ClientOnly>
      <Drawer
        v-model="isOutlineVisible"
        size="lg"
        :placement="isDesktop ? 'right' : 'bottom'"
        :title="t('doc.title')"
      >
        <DocsOutline :outline="page.body.toc?.links" />
      </Drawer>
    </ClientOnly>
  </div>
  <div v-else>
    <ErrorPage />
  </div>
</template>

<script lang="ts" setup>
import { Drawer } from "moongate-vue";
import { withLeadingSlash } from "ufo";
const route = useRoute();
const { locale, t } = useI18n();
const { isDesktop } = useResponsive();
const { isOutlineVisible, isOutlineIconVisible } = useOutline();

const slug = computed(() => {
  const path = withLeadingSlash(String(route.params.slug || "/"));
  // 移除语言前缀部分
  return path.replace(new RegExp(`^/(${locale.value})`), "") || "/";
});

const { data: page } = await useAsyncData(`about-${slug.value}`, () => {
  return queryCollection("about").path(`/about${slug.value}`).first();
});

// 监听文档详情页面内容是否有大纲目录，并设置是否显示大纲目录图标
watchEffect(() => {
  if (page.value && page.value.body.value && page.value.body.toc?.links) {
    isOutlineIconVisible.value = true;
  } else {
    isOutlineIconVisible.value = false;
  }
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
