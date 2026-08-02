import { redirect } from 'next/navigation'

// Root path — redirect to the primary inventory view
export default function Root() {
  redirect('/home')
}
