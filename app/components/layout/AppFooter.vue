<template>
  <Footer>
    <Container size="xl">
      <div class="flex items-center justify-between py-6">
        <!-- 左侧区域 -->
        <div class="left flex items-center gap-2">
          <span class="text-dim text-sm">
            © {{ dayjs().format("YYYY") }} MOONGATE
          </span>
        </div>

        <!-- 中间区域（预留，可放友情链接） -->
        <div class="center flex-1 flex justify-center" />

        <!-- 右侧区域 -->
        <div class="right flex items-center gap-3">
          <NuxtLink
            to="https://github.com/yuelinghuashu/moongate"
            target="_blank"
            rel="noopener noreferrer"
            class="text-dim hover:text-primary transition"
          >
            <Icon name="tabler:brand-github" />
          </NuxtLink>
          <NuxtLink
            to="https://moongate.top/feed.xml"
            target="_blank"
            rel="noopener noreferrer"
            class="text-dim hover:text-primary transition"
          >
            <Icon name="tabler:rss" />
          </NuxtLink>
        </div>
      </div>
    </Container>
  </Footer>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import { Footer, Container } from "moongate-vue";
</script>
