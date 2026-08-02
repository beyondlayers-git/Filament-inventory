import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/inventory'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Check if Supabase returned a signup disabled error in the URL params
  if (
    error === 'access_denied' ||
    (errorDescription &&
      (errorDescription.includes('Signups not allowed') ||
        errorDescription.includes('signup') ||
        errorDescription.includes('disabled')))
  ) {
    return NextResponse.redirect(`${origin}/unauthorized`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    // Check exchange code error details for signup restrictions
    if (
      exchangeError.message?.includes('Signups not allowed') ||
      exchangeError.message?.includes('signup') ||
      exchangeError.status === 422 ||
      exchangeError.status === 403
    ) {
      return NextResponse.redirect(`${origin}/unauthorized`)
    }
  }

  // Auth error — redirect back to login with error param
  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
