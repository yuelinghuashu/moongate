<template>
  <UCard class="w-100 ml-4 h-full leading-7.5 min-w-60 min-h-100 sticky">
    <!-- 二级标题 -->
    <ul>
      <li v-for="item in prop.outline" :key="item.id" class="indent-2">
        <a :href="`#${item.id}`">{{ item.text }}</a>

        <!-- 三级标题 -->
        <ul v-if="item.children">
          <li v-for="item2 in item.children" :key="item2.id" class="indent-8">
            <a :href="`#${item2.id}`">{{ item2.text }}</a>

            <!-- 四级标题 -->
            <ul v-if="item2.children">
              <li
                v-for="item3 in item2.children"
                :key="item3.id"
                class="indent-16"
              >
                <a :href="`#${item3.id}`">{{ item3.text }}</a>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </UCard>
</template>

<script lang="ts" setup>
const prop = defineProps(["outline"]);
</script>

<style scoped>
@media (max-width: 768px) {
  div {
    display: none;
  }
}
</style>
