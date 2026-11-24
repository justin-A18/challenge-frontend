<script setup lang="ts">
import FlowHeader from '~/shared/components/FlowHeader.vue';
import UiButton from '~/shared/components/UiButton.vue';
import UiIcon from '~/shared/components/UiIcon.vue';
import { KAMBISTA_DEMO_ACCOUNT, bankName } from '../constants/options';
import { formatMoney } from '../utils/money';
import { useTransfer } from '../composables/useTransfer';
const { state, copied, copy, confirmTransfer } = useTransfer();
</script>
<template>
  <FlowHeader :step="2" back="/operacion" />
  <main v-if="state.quote" class="mx-auto max-w-146 px-[30px] pb-10 pt-[18px] md:px-6 md:pt-10">
    <p class="mb-5 text-center text-xs text-gray-60 md:mb-8 md:text-base">El tipo de cambio podría actualizarse a las: <strong>13:15</strong></p>
    <section class="rounded-control border border-gray-21 bg-white px-5 py-6 md:p-8">
      <img src="/images/figma/Transfiere-validar-datos-2-1.png" alt="" class="mx-auto mb-4 h-22 w-32 object-contain" >
      <h1 class="mb-4 text-center text-xl font-bold md:text-2xl">Transfiere a Kambista</h1>
      <p class="mb-5 text-base leading-5 md:text-center">Transfiere desde tu app bancaria y guarda el <u class="font-semibold">número o código de operación</u> para el siguiente paso.</p>
      <dl class="mx-4 space-y-3 rounded-control border border-gray-25 p-3 text-sm md:mx-0">
        <div class="flex flex-col justify-between gap-1 md:flex-row"><dt class="text-xs font-bold text-gray-60">Banco</dt><dd class="font-bold">{{ bankName(state.quote.bankId) }}</dd></div>
        <div class="flex flex-col justify-between gap-1 md:flex-row"><dt class="text-xs font-bold text-gray-60">Monto</dt><dd class="font-bold">{{ formatMoney(state.quote.amount,state.quote.origin) }}</dd></div>
        <div class="flex flex-col justify-between gap-1 md:flex-row"><dt class="text-xs font-bold text-gray-60">Número de cuenta</dt><dd class="flex items-center gap-2 font-bold">{{ KAMBISTA_DEMO_ACCOUNT.number }}<button type="button" aria-label="Copiar número de cuenta" @click="copy(KAMBISTA_DEMO_ACCOUNT.number)"><UiIcon name="copy" :size="16" /></button></dd></div>
        <div class="flex flex-col justify-between gap-1 md:flex-row"><dt class="text-xs font-bold text-gray-60">RUC</dt><dd class="font-bold">{{ KAMBISTA_DEMO_ACCOUNT.ruc }}</dd></div>
        <div class="flex flex-col justify-between gap-1 md:flex-row"><dt class="text-xs font-bold text-gray-60">Titular de la cuenta</dt><dd class="font-bold">{{ KAMBISTA_DEMO_ACCOUNT.holder }}</dd></div>
        <div class="flex flex-col justify-between gap-1 md:flex-row"><dt class="text-xs font-bold text-gray-60">Tipo de cuenta</dt><dd class="font-bold">{{ KAMBISTA_DEMO_ACCOUNT.type }}</dd></div>
      </dl>
      <p v-if="copied" role="status" class="mt-2 text-center text-xs">{{ copied }}</p>
    </section>
    <UiButton class="mt-8" @click="confirmTransfer">YA HICE MI TRANSFERENCIA</UiButton>
  </main>
</template>

