import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL('/admin/login', request.url), 303);
}
