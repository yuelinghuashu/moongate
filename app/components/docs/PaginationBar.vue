<template>
  <div class="flex justify-center items-center">
    <UPagination
      v-model:page="pageModel"
      :total="total"
      :items-per-page="size"
    />

    <USelect v-model="sizeModel" :items="sizeOptions" class="ml-4" />

    <span class="ml-4">
      {{ t("docs.findCount", { count: total }) }}
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  page: { type: Number, default: 1 },
  size: { type: Number, default: 10 },
  total: { type: Number, required: true },
});

const emit = defineEmits(["update:page", "update:size"]);

// 创建可写的计算属性，用于 v-model:page
const pageModel = computed({
  get: () => props.page,
  set: (value) => emit("update:page", value),
});

// 创建可写的计算属性，用于 v-model
const sizeModel = computed({
  get: () => props.size,
  set: (value) => {
    emit("update:size", value);
    // 切换每页条数时重置页码为 1
    emit("update:page", 1);
  },
});

const sizeOptions = [5, 10, 15, 20];
</script>
