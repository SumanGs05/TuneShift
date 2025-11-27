import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/select', '/api/auth'];
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, check if user is authenticated
  // Note: In demo mode, we allow access even without auth
  // In production, uncomment the redirect logic
  
  // if (!req.auth && pathname.startsWith('/migrate')) {
  //   return NextResponse.redirect(new URL('/select', req.url));
  // }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|.*\\..*).*)'],
};


