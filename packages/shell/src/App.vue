<template>
  <main class="app">
    <PageHeader title="kacean-admin" />
    <p>默认分页大小：{{ DEFAULT_PAGE_SIZE }}</p>
    <p>公共包链路自检：{{ demoMessage }}</p>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PageHeader } from '@kacean/shared'
import { DEFAULT_PAGE_SIZE, isSuccessResponse } from '@kacean/common'
import type { ApiResponse } from '@kacean/types'

const res: ApiResponse<string> = { code: 0, message: 'ok', data: 'types → common → shared → shell 全部打通' }
const demoMessage = computed(() => (isSuccessResponse(res) ? res.data : res.message))
</script>

<style scoped>
.app {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}
</style>
