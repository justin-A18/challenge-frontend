import { nextTick } from 'vue';
import { z } from 'zod';
import { SESSION_KEY, OPERATION_KEY } from '../constants/storage';
const sessionSchema = z.object({
  authenticated: z.boolean(), email: z.string(), displayName: z.string(), profileCompleted: z.boolean(), fullName: z.string(),
});
export type DemoSession = z.infer<typeof sessionSchema>;

function emptySession(): DemoSession {
  return { authenticated: false, email: '', displayName: 'MARIA', profileCompleted: false, fullName: '' };
}

export function useSession() {
  const session = useState<DemoSession>('demo-session', emptySession);
  const initialized = useState('session-initialized', () => false);
  if (import.meta.client && !initialized.value) {
    try { const parsed = sessionSchema.safeParse(JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null')); if (parsed.success) session.value = parsed.data; } catch { /* A blocked store does not prevent a demo session. */ }
    initialized.value = true;
  }
  function startSession(email: string) { session.value = { ...emptySession(), authenticated: true, email: email.toLowerCase() }; }
  function completeProfile(name: string) {
    session.value = { ...session.value, profileCompleted: true, fullName: name, displayName: name.trim().split(/\s+/)[0]?.toLocaleUpperCase('es-PE') || 'MARIA' };
  }
  async function signOut() {
    session.value = emptySession();
    await navigateTo('/');
    clearNuxtState(['operation-state', 'quote-draft', 'bank-accounts', 'accounts-owner']);
    await nextTick();
    try { sessionStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(OPERATION_KEY); } catch { /* Storage may be unavailable. */ }
  }
  return { session, startSession, completeProfile, signOut };
}

