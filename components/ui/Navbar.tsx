import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/react'

export default function Navbar() {
  const router = useRouter()

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Mietobjekte', href: '/mietobjekte' },
    { name: 'Mietverhältnisse', href: '/mietverhaeltnisse' },
    { name: 'Zahlungen', href: '/zahlungen' },
  ]

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  router.pathname === item.href
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => signOut()}
              className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
