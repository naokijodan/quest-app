import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function createAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function createTestUser(email: string, password: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error && !error.message.includes('already been registered')) {
    throw error;
  }
  return data?.user;
}

export async function deleteTestUser(email: string) {
  const admin = createAdminClient();
  const { data: users } = await admin.auth.admin.listUsers();
  const user = users?.users?.find((u) => u.email === email);
  if (user) {
    await admin.from('users').delete().eq('id', user.id);
    await admin.auth.admin.deleteUser(user.id);
  }
}

export async function resetUserOnboarding(email: string) {
  const admin = createAdminClient();
  const { data: users } = await admin.auth.admin.listUsers();
  const user = users?.users?.find((u) => u.email === email);
  if (user) {
    await admin.from('users').delete().eq('id', user.id);
  }
}
