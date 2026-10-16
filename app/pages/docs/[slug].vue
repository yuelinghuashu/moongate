<template>
  <Skeleton v-if="!page" />
  <div v-else>
    <DocsMeta :date="page.date" :tags="page.tags" />

    <!-- 系列目录导航（当前文档属于某系列时显示） -->
    <DocsSeriesNavigation :series="page.series" :active="slug" />

    <!-- 请求语言无译文时回退到中文的提示条 -->
    <div
      v-if="page.isFallback"
      class="mb-4 px-4 py-2 text-sm rounded-sm border"
      style="border-color: var(--ui-border); color: var(--ui-text-muted)"
    >
      {{ t("docs.detail.fallbackNotice") }}
    </div>

    <article
      class="prose dark:prose-invert max-w-none prose-sm md:prose-base lg:prose-lg"
    >
      <h1 class="text-3xl font-bold">{{ page.title }}</h1>
      <!-- 正文 HTML 由后端在加载期做白名单清洗（moongate-api internal/loader/sanitize.go），
           SSR 与浏览器拿到的是同一份内容，因此这里直接渲染、不做运行期清洗
           （客户端清洗会造成首帧与服务端不一致）。Shiki 之后注入的高亮标记由
           shiki 自身转义，不引入新的注入面。 -->
      <!-- eslint-disable-next-line vue/no-v-html -- 见上方说明：内容已在后端清洗 -->
      <div class="shiki-content" v-html="contentRef" />
    </article>

    <ClientOnly>
      <Drawer
        v-model="isOutlineVisible"
        size="lg"
        :placement="isDesktop ? 'right' : 'bottom'"
        :title="t('docs.detail.title')"
      >
        <DocsOutline :outline="nestedOutline" />
      </Drawer>
    </ClientOnly>

    <SharedBuyMeCoffee class="mb-8 mt-8" />
  </div>
</template>

<script lang="ts" setup>
import { Drawer, Skeleton } from "moongate-vue";
import { resolveLangParam } from "~/utils/docs";
import useSettingStore from "~/stores/setting";
import type { ApiDocDetail } from "~/utils/apiTypes";

const route = useRoute();
const { t, locale } = useI18n();
const { isDesktop } = useResponsive();
const config = useRuntimeConfig();
const slug = computed(() => (route.params.slug as string) || "");
// 内容语言：由 /en URL 前缀（i18n locale）驱动
const lang = computed(() => resolveLangParam(locale.value));

// 详情响应 = 摘要字段 + 正文；契约见 utils/apiTypes.ts（与后端 DocDetail 对齐）
type DocDetailResponse = ApiDocDetail & {
  highlightedContent?: string; // 服务端异步高亮生成的完全体 HTML
};

// 复用公共 useDocDetail：数据获取 + Shiki 高亮 + 大纲提取
// key 与请求 URL 都由 slug/lang 派生，因此这里不需要再传 fetchKey
const { page, contentRef, nestedOutline } =
  useDocDetail<DocDetailResponse>(slug, lang);

// 目录抽屉的展开状态只有一个来源：stores/setting.ts（持久化，刷新后保持）
const settingStore = useSettingStore();
const isOutlineVisible = computed({
  get: () => settingStore.settings.ui.isOutlineVisible,
  set: (value: boolean) => settingStore.setOutlineVisible(value),
});

// ---------- SEO：canonical + hreflang 双语交替 ----------
const siteUrl = computed(() =>
  (config.public.siteUrl || "").replace(/\/$/, ""),
);
const docZhUrl = computed(() => `${siteUrl.value}/docs/${slug.value}`);
const docEnUrl = computed(() => `${siteUrl.value}/en/docs/${slug.value}`);
const canonicalUrl = computed(() => `${siteUrl.value}${route.path}`);

useHead(() => ({
  link: [
    { rel: "canonical", href: canonicalUrl.value } as const,
    { rel: "alternate", hreflang: "x-default", href: docZhUrl.value } as const,
    // 存在英文译文时声明双语交替页
    ...(page.value?.hasTranslation
      ? [
          {
            rel: "alternate",
            hreflang: "zh-CN",
            href: docZhUrl.value,
          } as const,
          { rel: "alternate", hreflang: "en", href: docEnUrl.value } as const,
        ]
      : []),
  ],
}));

useSeoMeta({
  title: page.value?.title || t("site.title"),
  description: page.value?.description || t("site.description"),
  ogTitle: page.value?.title || t("site.title"),
  ogDescription: page.value?.description || t("site.description"),
});
</script>
