import { shallowRef } from 'vue';
import { useForm } from 'vee-validate';
import { loginSchema } from '../schemas/login.schema';
import type { LoginValues } from '../types/login.types';
import { signIn } from '../services/auth.mock';
export function useLoginForm(
	onValid: (values: LoginValues) => void | Promise<void>,
) {
	const serviceError = shallowRef('');
	const form = useForm<LoginValues>({
		validationSchema: loginSchema,
		initialValues: { email: '', password: '' },
	});

	const [email, emailAttrs] = form.defineField('email');
	const [password, passwordAttrs] = form.defineField('password');

	async function submitValidLogin(values: LoginValues) {
		serviceError.value = '';
		try {
			const result = await signIn(values);
			if (!result.success) {
				serviceError.value = result.data.message;
				return;
			}
			await onValid(values);
		} catch {
			serviceError.value = 'No pudimos iniciar sesión. Intenta nuevamente.';
		}
	}

	const onSubmit = form.handleSubmit(submitValidLogin);

	return {
		email,
		emailAttrs,
		password,
		passwordAttrs,
		serviceError,
		errors: form.errors,
		isSubmitting: form.isSubmitting,
		onSubmit,
	};
}
