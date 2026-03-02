import { useSession } from 'next-auth/react'

export function useRolle() {
  const { data: session } = useSession()
  return session?.user?.rolle
}