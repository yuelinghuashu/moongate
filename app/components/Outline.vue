<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <ClientOnly>
    <div class="ml-4 sticky top-25 h-full">
      <!-- 目录开关 -->
      <UTooltip
        :text="isOutlineVisible ? '隐藏大纲' : '显示大纲'"
        :delay-duration="0"
      >
        <UIcon
          :name="isOutlineVisible ? 'i-tabler-eye' : 'i-tabler-eye-off'"
          class="absolute right-4 top-2 cursor-pointer"
          @click="isOutlineVisible = !isOutlineVisible"
        />
      </UTooltip>
      <!-- 目录卡片 -->
      <UCard v-if="isOutlineVisible" class="leading-7.5 min-h-100 min-w-60 max-w-80">
        <!-- 二级标题 -->
        <ul>
          <li v-for="item in prop.outline" :key="item.id" class="indent-2">
            <NuxtLink
              :href="`#${item.id}`"
              class="block"
              :class="route.fullPath.includes(item.id) ? 'nav-link active' : ''"
              >{{ item.text }}</NuxtLink
            >

            <!-- 三级标题 -->
            <ul v-if="item.children">
              <li
                v-for="item2 in item.children"
                :key="item2.id"
                class="indent-8"
              >
                <NuxtLink
                  :href="`#${item2.id}`"
                  class="block"
                  :class="
                    route.fullPath.includes(item2.id) ? 'nav-link active' : ''
                  "
                  >{{ item2.text }}</NuxtLink
                >

                <!-- 四级标题 -->
                <ul v-if="item2.children">
                  <li
                    v-for="item3 in item2.children"
                    :key="item3.id"
                    class="indent-16"
                  >
                    <NuxtLink
                      :href="`#${item3.id}`"
                      class="block"
                      :class="
                        route.fullPath.includes(item3.id)
                          ? 'nav-link active'
                          : ''
                      "
                      >{{ item3.text }}</NuxtLink
                    >
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </UCard>
    </div>
  </ClientOnly>
</template>

<script lang="ts" setup>
import { useLocalStorage } from "@vueuse/core";

const route = useRoute();

const prop = defineProps({
  outline: {
    type: Object,
    required: true,
  },
});

// 目录开关
const isOutlineVisible = useLocalStorage("isOutlineVisible", true);
</script>

<style scoped>
@media (max-width: 768px) {
  div {
    display: none;
  }
}
</style>
