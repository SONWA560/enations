import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/bracket',
  '/leaderboard',
  '/about',
  '/contact',
];

// Admin-only routes
const adminRoutes = [
  '/admin',
  '/admin/dashboard',
  '/admin/federations',
  '/admin/tournament',
];

// Representative routes (require authentication)
const representativeRoutes = [
  '/dashboard',
  '/federation',
  '/register-federation',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth token from cookie
  const authToken = request.cookies.get('auth-token')?.value;
  const userRole = request.cookies.get('user-role')?.value;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!authToken) {
    // Redirect to login with return URL
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin routes
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (userRole !== 'admin') {
      // Redirect non-admins to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Check representative routes
  if (representativeRoutes.some(route => pathname.startsWith(route))) {
    if (userRole !== 'representative' && userRole !== 'admin') {
      // Redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
