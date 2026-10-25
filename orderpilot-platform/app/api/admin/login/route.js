import { NextResponse } from 'next/server';
import { isAdminEmail } from '../../../../lib/adminAuth';
import { createSupabaseServerClient } from '../../../../lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const formData = await request.formData();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password || !(await isAdminEmail(email))) {
    return NextResponse.redirect(new URL('/admin/login?error=1', request.url), 303);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return NextResponse.redirect(new URL('/admin/login?error=1', request.url), 303);
  }

  return NextResponse.redirect(new URL('/admin', request.url), 303);
}
