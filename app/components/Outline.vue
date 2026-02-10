<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <UCard
    class="ml-4 leading-7.5 min-w-60 min-h-100 h-full relative"
    :ui="{ root: isOutlineVisible ? '' : 'min-w-0! min-h-0!' }"
  >
    <!-- 控制大纲目录的显示和隐藏图标 -->
    <UIcon
      :name="isOutlineVisible ? 'i-tabler:eye' : 'i-tabler:eye-off'"
      class="cursor-pointer absolute right-4 top-2"
      @click="isOutlineVisible = !isOutlineVisible"
    />

    <!-- 二级标题 -->
    <ul v-show="isOutlineVisible">
      <li v-for="item in prop.outline" :key="item.id" class="indent-2">
        <NuxtLink
          :href="`#${item.id}`"
          class="block"
          :class="route.fullPath.includes(item.id) ? 'nav-link active' : ''"
          >{{ item.text }}</NuxtLink
        >

        <!-- 三级标题 -->
        <ul v-if="item.children">
          <li v-for="item2 in item.children" :key="item2.id" class="indent-8">
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
                    route.fullPath.includes(item3.id) ? 'nav-link active' : ''
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
</template>

<script lang="ts" setup>
import useGlobalStore from "~/stores/global";
const { isOutlineVisible } = useGlobalStore();
const route = useRoute();

const prop = defineProps({
  outline: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
@media (max-width: 768px) {
  div {
    display: none;
  }
}
</style>
