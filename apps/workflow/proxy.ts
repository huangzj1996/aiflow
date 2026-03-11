import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Public paths that don't require authentication
const publicPaths = ['/account/login', '/account/verify', '/api/auth/register', '/api/auth/login', '/api/auth/verify']

// Static assets and Next.js internals
const ignorePaths = ['/_next', '/favicon.icon', '/public']

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (ignorePaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    if (publicPaths.some(p => pathname.startsWith(p))) {
        return NextResponse.next()
    }

    const token = request.cookies.get('auth-token')?.value

    if (!token) {
        // if (pathname.startsWith('/api/')) {
        //     return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        // }
        // const loginUrl = new URL('/account/login', request.url)
        // loginUrl.searchParams.set('redirect', pathname)
        // return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
