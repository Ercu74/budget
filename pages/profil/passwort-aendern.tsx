import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import nextAuthOptions from '../api/auth/[...nextauth]'

const authOptions = nextAuthOptions as NextAuthOptions

export default function PasswortAendern() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [altesPasswort, setAltesPasswort] = useState('')
  const [neuesPasswort, setNeuesPasswort] = useState('')
  const [neuesPasswortWiederholung, setNeuesPasswortWiederholung] = useState('')
  const [loading, setLoading] = useState(false)

  if (status === 'loading') return <div className="p-6">Lade...</div>
  if (!session) {
    router.push('/auth/anmelden')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (neuesPasswort !== neuesPasswortWiederholung) {
      toast.error('Die neuen Passwörter stimmen nicht überein')
      return
    }
    if (neuesPasswort.length < 6) {
      toast.error('Das neue Passwort muss mindestens 6 Zeichen lang sein')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/benutzer/passwort-aendern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ altesPasswort, neuesPasswort })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Passwort erfolgreich geändert')
        router.push('/')
      } else {
        toast.error(data.message || 'Fehler beim Ändern des Passworts')
      }
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded shadow p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Passwort ändern</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Altes Passwort</label>
            <input
              type="password"
              value={altesPasswort}
              onChange={(e) => setAltesPasswort(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Neues Passwort</label>
            <input
              type="password"
              value={neuesPasswort}
              onChange={(e) => setNeuesPasswort(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Neues Passwort wiederholen</label>
            <input
              type="password"
              value={neuesPasswortWiederholung}
              onChange={(e) => setNeuesPasswortWiederholung(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
              minLength={6}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Wird gespeichert...' : 'Passwort ändern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session) {
    return { redirect: { destination: '/auth/anmelden', permanent: false } }
  }
  return { props: {} }
}