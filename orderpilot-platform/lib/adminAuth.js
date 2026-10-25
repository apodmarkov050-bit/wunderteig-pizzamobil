import { createSupabaseServerClient } from './supabaseServer';
import { redirect } from 'next/navigation';

function allowedAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function isAdminEmail(email) {
  return Boolean(email && allowedAdminEmails().includes(email.toLowerCase()));
}

export async function getAdminUser() {
  if (allowedAdminEmails().length === 0) return null;

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.email || !(await isAdminEmail(user.email))) return null;
  return user;
}

export async function requireAdminPage() {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');
  return user;
}
