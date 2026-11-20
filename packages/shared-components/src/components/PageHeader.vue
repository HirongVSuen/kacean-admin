<template>
  <header class="page-header">
    <div class="page-header__content">
      <h2 class="page-header__title">
        {{ title }}
      </h2>
      <p
        v-if="description"
        class="page-header__description"
      >
        {{ description }}
      </p>
    </div>
    <div
      v-if="$slots.default"
      class="page-header__extra"
    >
      <slot />
    </div>
  </header>
</template>

<script setup lang="ts">
defineOptions({ name: 'PageHeader' })
defineProps<{ title: string; description?: string }>()
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.page-header__content {
  min-width: 0;
}

.page-header__title {
  margin: 0;
  color: var(--td-text-color-primary);
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
}

.page-header__description {
  margin: 6px 0 0;
  color: var(--td-text-color-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.page-header__extra {
  display: flex;
  flex: none;
  align-items: center;
  min-height: 34px;
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
  }

  .page-header__title {
    font-size: 22px;
  }
}
</style>
