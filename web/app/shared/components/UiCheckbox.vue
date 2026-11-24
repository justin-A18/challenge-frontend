<script setup lang="ts">
const model = defineModel<boolean>({ required: true });
defineProps<{ error?: string }>();
</script>
<template>
  <div><label class="flex items-start gap-2 text-xs leading-5">
    <input v-model="model" type="checkbox" class="mt-0.5 size-4 shrink-0 accent-secondary" :aria-invalid="!!error" >
    <span><slot /></span>
  </label><p v-if="error" role="alert" class="mt-1 text-xs text-danger">{{ error }}</p></div>
</template>
