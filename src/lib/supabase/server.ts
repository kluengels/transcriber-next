// access Supabase from Server Components, Server Actions, and Route Handlers, which run only on the server.


import { createServerClient} from "@supabase/ssr";
import { cookies } from "next/headers";


// used for server actions and route handlers
export async function createSupaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_SUPABASE_URL!,
    process.env.NEXT_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}




