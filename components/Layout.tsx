import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import Navbar from './Navbar'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Eğer auth sayfalarındaysak layout'u farklı gösterebiliriz
  if (router.pathname.startsWith('/auth')) {
    return <>{children}</>
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">Lade...</div>
  }

  if (!session) {
    // Eğer oturum yoksa login'e yönlendir
    if (typeof window !== 'undefined') {
      router.push('/auth/anmelden')
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}