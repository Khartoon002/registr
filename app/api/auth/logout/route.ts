import { NextResponse } from 'next/server'

const SESSION_COOKIE = 'adminSession'

export async function GET() {
  const res = NextResponse.redirect(new URL('/login', process.env.APP_BASE_URL || 'http://localhost:3000'))
  // Clear the cookie
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  return res
}
