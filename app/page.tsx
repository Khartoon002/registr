import { redirect } from 'next/navigation'

export default function Home() {
  // Always redirect visitors to the login page first
  redirect('/login')
}
