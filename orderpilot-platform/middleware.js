import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const isLegacyServerRoute =
    pathname === '/legacy' ||
    pathname.startsWith('/legacy/') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/api/orders' ||
    pathname.startsWith('/api/admin/');

  // Production defaults to a safe demo preview. The old single-restaurant
  // server endpoints are not suitable for public platform orders.
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.ORDERPILOT_DEMO_MODE !== 'false' &&
    isLegacyServerRoute
  ) {
    // Keep the legacy admin area private, but let the familiar /admin bookmark
    // open the password-protected OrderPilot restaurant demo instead.
    if (pathname === '/admin' || pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/restaurant/wunderteig', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: ['/legacy/:path*', '/api/orders', '/admin/:path*', '/api/admin/:path*'],
};
