import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse, type NextRequest } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

const protectedDashboardPaths = /^\/(?:en|vi)?\/dashboard/;
const loginPath = /^\/(?:en|vi)?\/login/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has('refresh_token');
  const userRole = request.cookies.get('user_role')?.value;

  // 1. Chặn khách vãng lai hoặc User vào Dashboard
  if (protectedDashboardPaths.test(pathname)) {
    if (!hasSession) {
      const url = request.nextUrl.clone();
      const localeMatch = pathname.match(/^\/(en|vi)/);
      url.pathname = `${localeMatch ? localeMatch[0] : ''}/login`;
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }
    // Nếu có session nhưng không phải Admin
    if (userRole !== 'Admin') {
      const url = request.nextUrl.clone();
      const localeMatch = pathname.match(/^\/(en|vi)/);
      url.pathname = `${localeMatch ? localeMatch[0] : ''}/`; // Đẩy về trang chủ
      return NextResponse.redirect(url);
    }
  }

  // 2. Chặn người dùng đã đăng nhập vào trang Login
  if (loginPath.test(pathname) && hasSession) {
    const url = request.nextUrl.clone();
    const localeMatch = pathname.match(/^\/(en|vi)/);
    // Nếu là Admin -> vào Dashboard, Nếu là User -> về trang Profile hoặc Home
    url.pathname = `${localeMatch ? localeMatch[0] : ''}${userRole === 'Admin' ? '/dashboard' : '/'}`;
    return NextResponse.redirect(url);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
