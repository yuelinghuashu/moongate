<template>
  <div v-if="page">
    <!-- 元数据区 -->
    <DocsMeta :date="page.date" :level="page.level" :tags="page.tags" />

    <!-- 文档内容 -->
    <article
      class="prose prose-sm dark:prose-invert max-w-none md:prose-base lg:prose-lg p-4 md:p-6 lg:p-8"
    >
      <ContentRenderer :value="page" />
    </article>

    <!-- 目录区 -->
    <ClientOnly>
      <Drawer
        v-model="isOutlineVisible"
        :placement="isDesktop ? 'right' : 'bottom'"
        size="lg"
        :title="t('doc.title')"
        :class="isMobile ? 'max-h-[80%]' : ''"
      >
        <DocsOutline :outline="page.body.toc?.links" />
      </Drawer>
    </ClientOnly>

    <!-- 打赏区 -->
    <SharedBuyMeCoffee class="mt-8 mb-8" />

    <!-- 评论区 -->
    <DocsCommentSection :permalink="page.permalink" />
  </div>
  <div v-else><ErrorPage /></div>
</template>

<script lang="ts" setup>
import { withLeadingSlash } from "ufo";
import { useLocalStorage } from "@vueuse/core";
import { Drawer } from "moongate-vue";

// ==================== 组合式函数 ====================
const { locale, t } = useI18n();
const route = useRoute();
const { isDesktop } = useResponsive();
const { isOutlineIconVisible } = useOutline();
const { isMobile } = useResponsive();

// ==================== 响应式状态 ====================
/**
 * 目录显示状态 - 持久化到 localStorage
 */

const isOutlineVisible: Ref<boolean> = useLocalStorage(
  "isOutlineVisible",
  false,
);

// ==================== 计算属性 ====================
/**
 * 移除语言前缀，得到文档原始路径
 * 例如：/en/docs/welcome -> /docs/welcome
 */
const slug: ComputedRef<string> = computed(() => {
  const path = withLeadingSlash(String(route.params.slug || "/"));
  // 移除语言前缀部分
  return path.replace(new RegExp(`^/(${locale.value})`), "") || "/";
});

// ==================== 数据获取 ====================
/**
 * 获取文档内容
 * 稳定查询：永远只查询 'docs' 这个集合
 */
const { data: page } = await useAsyncData(`docs-${slug.value}`, () => {
  return queryCollection("docs").path(`/docs${slug.value}`).first();
});

// ==================== 生命周期与副作用 ====================
/**
 * 监听文档详情页面内容是否有大纲目录，并设置是否显示大纲目录图标
 */
watchEffect(() => {
  if (page.value && page.value.body.value && page.value.body.toc?.links) {
    isOutlineIconVisible.value = true;
  } else {
    isOutlineIconVisible.value = false;
  }
}, {});

// ==================== SEO 元信息 ====================
if (page.value?.title && page.value?.description) {
  useSeoMeta({
    title: page.value.title as string,
    description: page.value.description as string,
    ogTitle: page.value.title as string,
    ogDescription: page.value.description as string,
  });
} else {
  useSeoMeta({
    title: t("title") as string,
    description: t("description") as string,
    ogTitle: t("title") as string,
    ogDescription: t("description") as string,
  });
}
</script>
