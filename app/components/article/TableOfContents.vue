<!-- 目录组件 -->
<template>
  <nav class="p-4 leading-loose">
    <!-- 二级标题 -->
    <ul>
      <li v-for="item in prop.outline" :key="item.id" class="indent-2">
        <NuxtLink
          :href="`#${item.id}`"
          class="block"
          :class="route.fullPath.includes(item.id) ? 'nav-link active' : ''"
          @click="isOutlineVisible = !isOutlineVisible"
          >{{ item.text }}
        </NuxtLink>

        <!-- 三级标题 -->
        <ul v-if="item.children">
          <li v-for="item2 in item.children" :key="item2.id" class="indent-8">
            <NuxtLink
              :href="`#${item2.id}`"
              class="block"
              :class="
                route.fullPath.includes(item2.id) ? 'nav-link active' : ''
              "
              @click="isOutlineVisible = !isOutlineVisible"
              >{{ item2.text }}
            </NuxtLink>

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
                  @click="isOutlineVisible = !isOutlineVisible"
                  >{{ item3.text }}
                </NuxtLink>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
import { useLocalStorage } from "@vueuse/core";
const route = useRoute();

const isOutlineVisible = useLocalStorage("isOutlineVisible", true);

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
