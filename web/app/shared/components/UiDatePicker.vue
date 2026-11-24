<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef, useId, useTemplateRef, watch } from 'vue';
import { usePopoverPlacement } from '~/shared/composables/usePopoverPlacement';
import UiIcon from './UiIcon.vue';

defineOptions({ inheritAttrs: false });

const model = defineModel<string>({ required: true });
const props = defineProps<{ label: string; error?: string; autocomplete?: string }>();
const id = useId();
const root = useTemplateRef<HTMLElement>('root');
const trigger = useTemplateRef<HTMLElement>('trigger');
const popup = useTemplateRef<HTMLElement>('popup');
const open = shallowRef(false);
const visibleMonth = shallowRef(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
const inputValue = shallowRef('');
const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const monthOptions = Array.from({ length: 12 }, (_, month) => ({
  value: month,
  label: new Intl.DateTimeFormat('es-PE', { month: 'long' }).format(new Date(2020, month, 1)),
}));
const yearOptions = Array.from({ length: 101 }, (_, offset) => new Date().getFullYear() - offset);
const { placement, positioned } = usePopoverPlacement(trigger, popup, open);

function parseDate(value: string) {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const localized = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  const year = Number(iso?.[1] ?? localized?.[3]);
  const month = Number(iso?.[2] ?? localized?.[2]);
  const day = Number(iso?.[3] ?? localized?.[1]);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

function toIso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function toDisplay(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function getCalendarDay(
  index: number,
  start: Date,
  month: number,
  today: string,
  selected: string,
) {
  const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
  const iso = toIso(date);
  return {
    date,
    iso,
    day: date.getDate(),
    currentMonth: date.getMonth() === month,
    today: iso === today,
    selected: iso === selected,
    future: iso > today,
    label: new Intl.DateTimeFormat('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date),
  };
}

function syncInputFromModel(value: string) {
  const date = parseDate(value);
  inputValue.value = date ? toDisplay(date) : '';
  if (date) visibleMonth.value = new Date(date.getFullYear(), date.getMonth(), 1);
}
watch(model, syncInputFromModel, { immediate: true });

function getCalendarDays() {
  const year = visibleMonth.value.getFullYear();
  const month = visibleMonth.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - mondayOffset);
  const today = toIso(new Date());
  const selected = model.value;

  const dayCount = new Date(year, month + 1, 0).getDate();
  const weekCount = Math.ceil((mondayOffset + dayCount) / 7);
  return Array.from({ length: weekCount * 7 }, (_, index) =>
    getCalendarDay(index, start, month, today, selected),
  );
}
const days = computed(getCalendarDays);

function showCalendar() {
  if (open.value) return;
  const selected = parseDate(model.value);
  const current = selected ?? new Date();
  visibleMonth.value = new Date(current.getFullYear(), current.getMonth(), 1);
  open.value = true;
}

function updateInput(event: Event) {
  const value = (event.target as HTMLInputElement).value.trim();
  inputValue.value = value;
  const date = parseDate(value);
  model.value = date ? toIso(date) : '';
  if (date) visibleMonth.value = new Date(date.getFullYear(), date.getMonth(), 1);
}

function normalizeInput() {
  const date = parseDate(inputValue.value);
  inputValue.value = date ? toDisplay(date) : '';
  model.value = date ? toIso(date) : '';
}

function selectDay(date: Date) {
  model.value = toIso(date);
  inputValue.value = toDisplay(date);
  open.value = false;
}

function changeMonth(offset: number) {
  visibleMonth.value = new Date(
    visibleMonth.value.getFullYear(),
    visibleMonth.value.getMonth() + offset,
    1,
  );
}

function setMonth(event: Event) {
  visibleMonth.value = new Date(
    visibleMonth.value.getFullYear(),
    Number((event.target as HTMLSelectElement).value),
    1,
  );
}

function setYear(event: Event) {
  visibleMonth.value = new Date(
    Number((event.target as HTMLSelectElement).value),
    visibleMonth.value.getMonth(),
    1,
  );
}

function clear() {
  model.value = '';
  inputValue.value = '';
  open.value = false;
}

function closeOutside(event: PointerEvent) {
  if (event.target instanceof Node && !root.value?.contains(event.target)) open.value = false;
}

function handleKeydown(event: KeyboardEvent) {
  if (
    event.target instanceof HTMLInputElement
    && (event.key === 'Enter' || event.key === 'ArrowDown')
  ) {
    event.preventDefault();
    showCalendar();
  }
  if (event.key === 'Escape' && open.value) {
    open.value = false;
    root.value?.querySelector<HTMLInputElement>('input')?.focus();
  }
}

function registerOutsidePointerListener() {
  document.addEventListener('pointerdown', closeOutside);
}

function unregisterOutsidePointerListener() {
  document.removeEventListener('pointerdown', closeOutside);
}

onMounted(registerOutsidePointerListener);
onBeforeUnmount(unregisterOutsidePointerListener);
</script>

<template>
  <div ref="root" class="relative min-w-0" :class="$attrs.class" @keydown="handleKeydown">
    <label :for="id" class="mb-1.5 block text-sm text-gray-60">{{ props.label }}</label>
    <div ref="trigger" class="relative">
      <input
        :id="id"
        v-bind="{ ...$attrs, class: undefined }"
        :value="inputValue"
        type="text"
        inputmode="numeric"
        :placeholder="'DD/MM/AAAA'"
        :autocomplete="props.autocomplete"
        :aria-invalid="!!props.error"
        :aria-describedby="props.error ? `${id}-error` : undefined"
        aria-haspopup="dialog"
        :aria-expanded="open"
        :aria-controls="`${id}-calendar`"
        class="min-h-11 w-full min-w-0 rounded-control border bg-white py-2.5 pl-4 pr-11 text-sm placeholder:text-gray-40 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
        :class="props.error ? 'border-danger' : 'border-gray-25'"
        @click="showCalendar"
        @input="updateInput"
        @blur="normalizeInput"
      >
      <button
        type="button"
        :aria-label="open ? 'Cerrar calendario' : 'Abrir calendario'"
        :aria-expanded="open"
        class="absolute inset-y-0 right-1 grid w-9 place-items-center rounded-control text-gray-60 transition-colors hover:bg-gray-20 hover:text-secondary"
        @click="open ? (open = false) : showCalendar()"
      >
        <UiIcon name="calendar" :size="19" />
      </button>
    </div>
    <p v-if="props.error" :id="`${id}-error`" role="alert" class="mt-1 text-xs text-danger">{{ props.error }}</p>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="scale-95 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition duration-120 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 opacity-0"
    >
      <section
        v-if="open"
        :id="`${id}-calendar`"
        ref="popup"
        role="dialog"
        aria-label="Calendario de fecha de nacimiento"
        class="absolute z-50 w-[min(280px,calc(100vw-2rem))] rounded-panel border border-gray-21 bg-white p-2.5 text-secondary shadow-[0_14px_38px_rgba(6,15,38,.16)]"
        :class="[
          placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          placement === 'top' ? 'origin-bottom' : 'origin-top',
          'right-0 sm:left-0 sm:right-auto',
        ]"
        :style="{ visibility: positioned ? 'visible' : 'hidden' }"
      >
        <header class="mb-2 flex items-center justify-between gap-1">
          <button
            type="button"
            aria-label="Mes anterior"
            class="grid size-7 place-items-center rounded-full text-gray-60 transition-colors hover:bg-gray-20 hover:text-secondary"
            @click="changeMonth(-1)"
          >
            <UiIcon name="chevron-left" :size="19" />
          </button>
          <div class="flex min-w-0 items-center gap-1">
            <select
              aria-label="Mes"
              :value="visibleMonth.getMonth()"
              class="max-w-30 cursor-pointer appearance-none rounded-control bg-gray-10 px-1.5 py-1.5 text-[13px] font-semibold capitalize outline-none transition-colors hover:bg-gray-20 focus-visible:ring-2 focus-visible:ring-info"
              @change="setMonth"
            >
              <option v-for="month in monthOptions" :key="month.value" :value="month.value">{{ month.label }}</option>
            </select>
            <select
              aria-label="Año"
              :value="visibleMonth.getFullYear()"
              class="cursor-pointer rounded-control bg-gray-10 px-1.5 py-1.5 text-[13px] font-semibold outline-none transition-colors hover:bg-gray-20 focus-visible:ring-2 focus-visible:ring-info"
              @change="setYear"
            >
              <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
          <button
            type="button"
            aria-label="Mes siguiente"
            class="grid size-7 place-items-center rounded-full text-gray-60 transition-colors hover:bg-gray-20 hover:text-secondary"
            @click="changeMonth(1)"
          >
            <UiIcon name="chevron-right" :size="19" />
          </button>
        </header>

        <div class="grid grid-cols-7 gap-y-0.5">
          <span v-for="(weekday, index) in weekdays" :key="index" class="grid size-7 place-items-center text-[10px] font-semibold text-gray-60">{{ weekday }}</span>
          <button
            v-for="day in days"
            :key="day.iso"
            type="button"
            :aria-label="day.label"
            :aria-current="day.today ? 'date' : undefined"
            :aria-pressed="day.selected"
            :disabled="day.future"
            class="grid size-7 place-items-center rounded-full text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info disabled:cursor-not-allowed disabled:opacity-30"
            :class="day.selected ? 'bg-secondary font-semibold text-white' : day.currentMonth ? 'hover:bg-primary-soft' : 'text-gray-40 hover:bg-gray-20'"
            @click="selectDay(day.date)"
          >
            {{ day.day }}
          </button>
        </div>
        <footer class="mt-2 flex items-center justify-between border-t border-gray-21 pt-2">
          <button type="button" class="rounded px-2 py-1 text-[11px] font-semibold text-gray-60 transition-colors hover:bg-gray-20 hover:text-secondary" @click="clear">Limpiar</button>
          <span class="text-[10px] text-gray-40">DD / MM / AAAA</span>
        </footer>
      </section>
    </Transition>
  </div>
</template>
