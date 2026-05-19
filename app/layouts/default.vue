<template>
  <div class="min-h-screen flex flex-col">
    <LayoutAppHeader />

    <Main class="mt-4">
      <Container size="xl">
        <slot />
      </Container>
    </Main>

    <LayoutAppFooter />

    <Modal v-model="settingStore.isLoginDialogVisible" :title="t('user.title')">
      <template #default
        ><div class="text-center">
          <div>{{ t("user.description") }}</div>
          <SharedLogin />
        </div>
      </template>
    </Modal>

  
  </div>
</template>

<script lang="ts" setup>
import { Main, Container, Modal, Drawer } from "moongate-vue";
import useSettingStore from "~/stores/setting";

const settingStore = useSettingStore();
const { t } = useI18n();
</script>

<style scoped></style>
