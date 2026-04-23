process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Bỏ qua lỗi self-signed certificate khi gọi localhost HTTPS từ Next.js Server

import { NextRequest, NextResponse } from 'next/server';
import { serverLogin, serverRegister, serverRefresh, serverLogout } from '@/lib/server';

const COOKIE_NAME = 'refresh_token';

function extractTokenFromSetCookie(setCookieStr: string | null): string | null {
  if (!setCookieStr) return null;
  // .NET có thể trả về nhiều cookie trong cùng một chuỗi, tách ra để tìm đúng
  const parts = setCookieStr.split(/,(?=[^ ])/);
  for (const part of parts) {
    const match = part.match(/refresh_token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const action = slug[0];

  try {
    if (action === 'login') {
      const { email, password } = await req.json();
      const { data, setCookie } = await serverLogin(email, password);

      const res = NextResponse.json({ accessToken: data.accessToken, user: data.user });
      const token = extractTokenFromSetCookie(setCookie);
      if (token) res.cookies.set({ name: COOKIE_NAME, value: token, ...COOKIE_OPTS });
      return res;
    }

    if (action === 'register') {
      const { fullName, email, password } = await req.json();
      const { data, setCookie } = await serverRegister(fullName, email, password);

      const res = NextResponse.json({ accessToken: data.accessToken, user: data.user });
      const token = extractTokenFromSetCookie(setCookie);
      if (token) res.cookies.set({ name: COOKIE_NAME, value: token, ...COOKIE_OPTS });
      return res;
    }

    if (action === 'refresh') {
      const refreshToken = req.cookies.get(COOKIE_NAME)?.value;
      if (!refreshToken) return NextResponse.json({ error: 'No session' }, { status: 401 });

      const result = await serverRefresh(refreshToken);
      if (!result) {
        const res = NextResponse.json({ error: 'Session expired' }, { status: 401 });
        res.cookies.delete(COOKIE_NAME);
        return res;
      }

      const res = NextResponse.json({ accessToken: result.data.accessToken, user: result.data.user });
      const newToken = extractTokenFromSetCookie(result.setCookie);
      if (newToken) res.cookies.set({ name: COOKIE_NAME, value: newToken, ...COOKIE_OPTS });
      return res;
    }

    if (action === 'logout') {
      const refreshToken = req.cookies.get(COOKIE_NAME)?.value ?? '';
      const accessToken = req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
      if (refreshToken) await serverLogout(refreshToken, accessToken);

      const res = NextResponse.json({ ok: true });
      res.cookies.delete(COOKIE_NAME);
      return res;
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    const status = message.toLowerCase().includes('credential') ||
      message.toLowerCase().includes('invalid') ||
      message.toLowerCase().includes('expired') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
