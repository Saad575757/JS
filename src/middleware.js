import { NextResponse } from 'next/server';

export function middleware(request) {
  // Protect all /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};