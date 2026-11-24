<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue';
import UiIcon from './UiIcon.vue';

const open = defineModel<boolean>({ required: true });
defineProps<{ title: string; message: string }>();

let timeout: ReturnType<typeof setTimeout> | undefined;

function clearTimer() {
  if (timeout) clearTimeout(timeout);
  timeout = undefined;
}

function closeToast() {
  open.value = false;
}

function handleOpenChange(value: boolean) {
  clearTimer();
  if (value) timeout = setTimeout(closeToast, 6000);
}

watch(open, handleOpenChange, { immediate: true });

onBeforeUnmount(clearTimer);
</script>

<template>
  <div class="pointer-events-none fixed inset-x-4 top-4 z-100 sm:left-auto sm:right-6 sm:w-[min(420px,calc(100vw-3rem))]">
    <Transition name="ui-toast">
      <section
        v-if="open"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        class="pointer-events-auto flex items-start gap-3 rounded-panel border border-gray-21 border-l-4 border-l-danger bg-white p-4 text-secondary shadow-[0_12px_36px_rgba(6,15,38,.18)]"
      >
        <span class="grid size-8 shrink-0 place-items-center rounded-full bg-danger-soft text-lg font-bold text-danger" aria-hidden="true">!</span>
        <div class="min-w-0 flex-1 pt-0.5">
          <h2 class="text-sm font-bold">{{ title }}</h2>
          <p class="mt-1 text-sm leading-5 text-gray-60">{{ message }}</p>
        </div>
        <button
          type="button"
          aria-label="Cerrar notificación"
          class="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-gray-60 transition-colors hover:bg-gray-20 hover:text-secondary"
          @click="open = false"
        >
          <UiIcon name="close" :size="18" />
        </button>
      </section>
    </Transition>
  </div>
</template>

<style scoped>
.ui-toast-enter-active,
.ui-toast-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.ui-toast-enter-from,
.ui-toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
