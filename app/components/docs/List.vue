<template>
  <div
    class="mt-4 mb-8 gap-2 docs-grid"
    :class="isDesktop ? 'grid grid-cols-2' : 'grid grid-cols-1'"
  >
    <UBlogPost
      v-for="(item, index) in props.docs"
      :key="item.id"
      :ui="{
        body: 'sm:p-4',
        description: viewMode === 1 ? 'line-clamp-2' : '',
        title: viewMode === 1 ? '' : 'line-clamp-1',
        footer: 'px-4 w-full flex flex-wrap',
      }"
      :title="item.title"
      :description="props.viewMode === 2 || isMobile ? '' : item.description"
      :date="item.date"
      :to="localePath(item.path)"
      class="card"
      :class="
        isDesktop && docs.length % 2 !== 0 && index === docs.length - 1
          ? 'col-span-2'
          : ''
      "
    >
      <template v-if="props.viewMode === 1" #footer>
        <NuxtLink
          v-for="tag in item.tags"
          :key="tag"
          :to="props.getTagLink(tag)"
          rel="noopener noreferrer"
          class="mr-2 inline-block nav-link"
          :class="{ active: props.isTagSelected(tag) }"
          @click.prevent="emit('tag-click', tag, $event)"
        >
           <em>#{{ tag }}</em>
        </NuxtLink>
      </template>
    </UBlogPost>
  </div>
</template>

<script lang="ts" setup>
const localePath = useLocalePath();
const { isDesktop, isMobile } = useResponsive();

const props = defineProps({
  docs: { type: Array, required: true },
  viewMode: { type: Number, required: true },
  tags: { type: Array, required: true },
  getTagLink: { type: Function, required: true },
  isTagSelected: { type: Function, required: true },
});

const emit = defineEmits(["tag-click"]);
</script>
