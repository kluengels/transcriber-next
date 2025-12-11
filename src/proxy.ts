import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // define protected routes
  matcher: [
    "/projects/:path*",
    "/upload",
    "/transcript/:path*",
    "/logout",
    "/account/:path*",
    
  ],
};
