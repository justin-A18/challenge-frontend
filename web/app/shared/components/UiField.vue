<script setup lang="ts">
import { useId, shallowRef } from 'vue';
import UiIcon from './UiIcon.vue';
defineOptions({ inheritAttrs: false });
const model = defineModel<string | number | undefined>({ required: true });
const { label, error, type = 'text', placeholder, autocomplete } = defineProps<{
  label: string; error?: string; type?: string; placeholder?: string; autocomplete?: string;
}>();
const id = useId();
const visible = shallowRef(false);
</script>
<template>
  <div class="min-w-0" :class="$attrs.class">
    <label :for="id" class="mb-1.5 block text-sm text-gray-60">{{ label }}</label>
    <div class="relative">
      <input
:id="id" v-model="model" v-bind="{ ...$attrs, class: undefined }" :type="type === 'password' && visible ? 'text' : type"
        :placeholder="placeholder" :autocomplete="autocomplete" :aria-invalid="!!error" :aria-describedby="error ? `${id}-error` : undefined"
        class="min-h-11 w-full min-w-0 rounded-control border bg-white px-4 py-2.5 text-sm placeholder:text-gray-40 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
        :class="[error ? 'border-danger' : 'border-gray-25', type === 'password' ? 'pr-12' : '']" >
      <button
v-if="type === 'password'" type="button" :aria-label="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'" :aria-pressed="visible"
        class="absolute inset-y-0 right-1 flex w-10 items-center justify-center" @click="visible = !visible">
        <UiIcon :name="visible ? 'eye-off' : 'eye'" :size="19" />
      </button>
    </div>
    <p v-if="error" :id="`${id}-error`" role="alert" class="mt-1 text-xs text-danger">{{ error }}</p>
  </div>
</template>
