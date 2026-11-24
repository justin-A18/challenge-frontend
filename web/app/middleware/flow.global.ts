import { useSession } from '~/shared/composables/useSession';
import { useOperationState } from '~/modules/transactions/composables/useOperationState';

function enforceFlowNavigation(to: { path: string }) {
  if (import.meta.server) return;
  const { session } = useSession();
  const { state } = useOperationState();
  const login = ['/', '/login'].includes(to.path);
  if (!session.value.authenticated && !login) return navigateTo('/');
  if (session.value.authenticated && login) {
    return navigateTo(session.value.profileCompleted ? '/inicio' : '/registro');
  }
  if (!session.value.profileCompleted && !login && to.path !== '/registro') {
    return navigateTo('/registro');
  }
  if (to.path === '/operacion' && !state.value.pendingQuote) {
    return navigateTo('/inicio');
  }
  if (to.path.startsWith('/operacion/') && !state.value.quote) {
    return navigateTo(state.value.pendingQuote ? '/operacion' : '/inicio');
  }
  if (
    ['/operacion/constancia', '/operacion/exito'].includes(to.path) &&
    !state.value.quote?.transferred
  ) {
    return navigateTo('/operacion/transferencia');
  }
  if (to.path === '/operacion/exito' && !state.value.quote?.submitted) {
    return navigateTo('/operacion/constancia');
  }
}

export default defineNuxtRouteMiddleware(enforceFlowNavigation);
