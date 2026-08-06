<template>
  <Container style="padding: 0">
    <Table :columns="columns" :data="projectsData">
      <template #column-link="{ row }">
        <NuxtLink :to="row.link" target="_blank" rel="noopener noreferrer"
          >🔗</NuxtLink
        >
      </template>
    </Table>
  </Container>
</template>

<script setup lang="ts">
import { Container, Table } from "moongate-vue";
import type { TableColumn } from "moongate-vue";

const { tm } = useI18nSafe();

/** 作品列表行数据结构 */
interface ProjectRow {
  name: string
  description: string
  link: string
}

// i18n 翻译数据是运行时获取的，类型断言确保与 TableColumn<ProjectRow> 匹配
const columns = tm("projects.columns") as TableColumn<ProjectRow>[];
const projectsData = tm("projects.data") as ProjectRow[];
</script>