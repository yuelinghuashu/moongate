<template>
  <Container size="sm" style="padding: 0">
    <Table :columns="tm('projects.columns')" :data="tm('projects.data')">
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
const { tm } = useI18nSafe();
</script>
