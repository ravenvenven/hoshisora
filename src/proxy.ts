import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  // 1. Ambil URL rute saat ini
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 2. Jika user mengakses halaman login, langsung loloskan tanpa babibu (Whitelist Mutlak)
  if (pathname === '/admin/login' || pathname === '/admin/login/') {
    return NextResponse.next();
  }

  // 3. Buat response utama untuk sinkronisasi cookies
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    // Inisialisasi Supabase Server Client yang lebih ketat
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set({ name, value, ...options });
              response.cookies.set({ name, value, ...options });
            });
          },
        },
      }
    );

    // Ambil data user aktif
    const { data: { user } } = await supabase.auth.getUser();

    // 🔒 Proteksi Area /admin dan sub-foldernya (order, products, dll)
    if (pathname.startsWith('/admin')) {
      
      // Jika session tidak terbaca (null), tendang ke halaman login
      if (!user) {
        console.log("Akses ditolak: User tidak ditemukan / null");
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Jika berhasil login tapi emailnya bukan email admin lu
      if (user.email !== 'bersamaa515@gmail.com') {
        console.log("Akses ditolak: Email bukan admin resmi");
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
  } catch (e) {
    console.error("Proxy Gateway Error:", e);
  }

  return response;
}

export const config = {
  // Lindungi area admin, tapi kecualikan aset statis internal Next.js agar tidak loop
  matcher: ['/admin/:path*'],
};