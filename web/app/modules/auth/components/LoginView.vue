<script setup lang="ts">
import { shallowRef } from 'vue';
import UiField from '~/shared/components/UiField.vue';
import UiButton from '~/shared/components/UiButton.vue';
import UiDialog from '~/shared/components/UiDialog.vue';
import BrandLogo from '~/shared/components/BrandLogo.vue';
import { useLoginForm } from '../composables/useLoginForm';
import type { LoginValues } from '../types/login.types';
import { useSession } from '~/shared/composables/useSession';
const { startSession } = useSession();
async function handleLoginSuccess(values: LoginValues) {
	startSession(values.email);
	await navigateTo('/registro');
}
const {
	email,
	emailAttrs,
	password,
	passwordAttrs,
	errors,
	isSubmitting,
	onSubmit,
	serviceError,
} = useLoginForm(handleLoginSuccess);
const help = shallowRef(false);
</script>
<template>
	<main class="grid min-h-dvh bg-gray-20 md:grid-cols-2">
		<section
			class="hidden flex-col justify-center bg-linear-to-tr from-login-bottom to-login-top px-[12.2%] text-white md:flex">
			<BrandLogo
				light
				class="mx-auto mb-20 w-77!" />
			<div class="space-y-15">
				<div class="flex items-start gap-7"
					><img
						src="/images/figma/Login-2-1.png"
						alt=""
						class="h-16 w-17.5 shrink-0 object-contain" />
					<div>
						<h2 class="mb-2 text-xl font-bold">Cotiza tu operación</h2>
						<p class="text-sm font-semibold leading-4.75"
							>Utiliza la calculadora para verificar el
							<span class="text-primary">Tipo de Cambio</span> en tiempo real
						</p>
					</div>
				</div>
				<div class="flex items-start gap-7"
					><img
						src="/images/figma/Login-2-2.png"
						alt=""
						class="h-16 w-17.5 shrink-0 object-contain" />
					<div>
						<h2 class="mb-2 text-xl font-bold">Realiza la transferencia</h2>
						<p class="text-sm font-semibold leading-4.75"
							>Envía desde tu banco el
							<span class="text-primary">dinero</span> que deseas cambiar a la
							<span class="text-primary">cuenta</span> de Kambista indicada
						</p>
					</div>
				</div>
				<div class="flex items-start gap-7"
					><img
						src="/images/figma/Login-2-3.png"
						alt=""
						class="h-16 w-17.5 shrink-0 object-contain" />
					<div>
						<h2 class="mb-2 text-xl font-bold">Obtén tu dinero</h2>
						<p class="text-sm font-semibold leading-4.75"
							>El dinero será <span class="text-primary">depositado</span> en tu
							cuenta de destino</p
						>
					</div>
				</div>
			</div>
		</section>
		<section
			class="px-6 pb-12 pt-31.25 md:flex md:items-center md:justify-center md:p-12">
			<div class="mx-auto w-full max-w-85.5">
				<BrandLogo class="mx-auto mb-12 w-35! md:hidden" />
				<h1
					class="mb-17.5 text-center text-2xl font-normal md:mb-8 md:text-left md:text-[28px] md:font-bold"
					>Inicia sesión
				</h1>
				<form
					novalidate
					@submit="onSubmit">
					<div class="space-y-5">
						<UiField
							v-model="email"
							v-bind="emailAttrs"
							label="Correo electrónico"
							type="email"
							autocomplete="username"
							placeholder="Escribe tu correo"
							:error="errors.email" />
						<UiField
							v-model="password"
							v-bind="passwordAttrs"
							label="Contraseña"
							type="password"
							autocomplete="current-password"
							placeholder="Escribe tu contraseña"
							:error="errors.password" />
					</div>
					<button
						type="button"
						class="mx-auto mt-5 block text-xs text-gray-60 underline"
						@click="help = true"
						>¿Olvidaste tu contraseña?</button
					>
					<p
						v-if="serviceError"
						role="alert"
						class="mt-4 text-center text-sm text-danger"
						>{{ serviceError }}</p
					>
					<UiButton
						type="submit"
						:busy="isSubmitting"
						class="mt-23 md:mt-10"
						:disabled="!email || !password">
						INICIAR SESIÓN
					</UiButton>
				</form>
				<p class="mt-7 text-center text-sm text-gray-60"
					>¿No tienes cuenta?
					<NuxtLink
						to="/registro"
						class="underline"
						>Regístrate aquí</NuxtLink
					>
				</p>
			</div>
		</section>
		<UiDialog
			v-model="help"
			title="Recuperar contraseña">
			<p class="text-sm leading-6"
				>Para recorrer esta demostración, usa el correo demo@kambista.com y la
				contraseña Demo1234!.</p
			>
			<UiButton
				class="mt-6"
				@click="help = false"
				>ENTENDIDO</UiButton
			>
		</UiDialog>
	</main>
</template>
