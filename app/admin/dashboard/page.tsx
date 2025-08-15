import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Dashboard',
  description: 'Dashboard page',
}

export default function Dashboard() {
  redirect('/gestion')
  return null
}
