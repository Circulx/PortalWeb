import { NextResponse, NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'gyuhiuhthoju2596rfyjhtfykjb'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth-token')

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    jwt.verify(String(token), JWT_SECRET)
    return NextResponse.next()
  } catch (error) {
    console.error('JWT verification failed:', error)
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
}

export const config = {
  matcher: ['/api/sellerProducts', '/dashboard/:path*'],
}