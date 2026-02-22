<!-- eslint-disable vue/no-useless-template-attributes -->
<template>
  <div class="min-h-screen flex flex-col">
    <!-- 头部 -->
    <LayoutAppHeader />

    <!-- 主体 -->
    <UPage
      :ui="{
        root: 'flex-1',
        center:
          'w-full max-w-(--ui-container) mx-auto mt-8 px-4 sm:px-6 lg:px-8',
      }"
    >
      <!-- 内容区域 -->
      <template #default>
        <slot />
        <UModal
          v-model:open="settingStore.isLoginDialogVisible"
          :title="t('user.title')"
          :description="t('user.description')"
          :ui="{ body: 'text-center' }"
        >
          <template #body> <SharedLogin /></template>
        </UModal>
      </template>
    </UPage>

    <!-- 底部 -->
    <LayoutAppFooter />
  </div>
</template>

<script lang="ts" setup>
import useSettingStore from "~/stores/setting";

const settingStore = useSettingStore();
const { t } = useI18n();
</script>

<style scoped></style>
