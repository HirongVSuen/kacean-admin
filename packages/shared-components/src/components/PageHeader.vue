<template>
  <header class="page-header">
    <h2 class="page-header__title">
      {{ title }}
    </h2>
    <div class="page-header__extra">
      <slot />
    </div>
  </header>
</template>

<script setup lang="ts">
defineOptions({ name: 'PageHeader' })
defineProps<{ title: string }>()
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}

.page-header__title {
  margin: 0;
  font-size: 18px;
}
</style>
