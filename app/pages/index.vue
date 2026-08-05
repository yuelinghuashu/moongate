<template>
  <Hero :title="t('site.title')" :description="t('site.description')">
    <template #actions>
      <NuxtLink
        :to="localePath('/docs')"
        class="mg-button mg-button-filled-primary mg-button-md"
      >
        // Access the Gate
        <Icon name="tabler:arrow-right" class="h-4" />
      </NuxtLink>
    </template>
  </Hero>
</template>

<script lang="ts" setup>
import { Hero } from "moongate-vue";
import useSettingStore from "~/stores/setting";

const { t } = useI18n();
const localePath = useLocalePath();
const settingStore = useSettingStore();

// 监听路由变化，立即将 /docs? 改成 /docs
const router = useRouter();
const route = useRoute();

watch(
  () => route.fullPath,
  (newPath) => {
    if (newPath.endsWith("?")) {
      router.replace({ path: route.path, query: undefined });
    }
  },
  { immediate: true },
);

// 计算是否跳过首页
const homepageBehavior = computed(
  () => settingStore.settings?.homepageBehavior,
);

// 标记是否已经执行过跳转，避免重复触发
let hasRedirected = false;

// 仅在客户端执行跳转（SSR 时跳过）
onMounted(() => {
  // 确保只在客户端且未跳转过
  if (import.meta.client && !hasRedirected && homepageBehavior.value === 32) {
    hasRedirected = true;
    // 注意：需避免当前已经处在 /docs 页面时再次跳转（一般情况下不会，但做好防御）
    const targetPath = localePath("/docs");
    if (router.currentRoute.value.path !== targetPath) {
      navigateTo(targetPath, { replace: true }); // 使用 replace 避免在历史记录中留下首页
    }
  }
});

// SEO 标题/描述直接复用站点 i18n 文案，避免双份维护
const title = t("site.title");
const description = t("site.description");

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
});
</script>

<style></style>
