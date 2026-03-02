import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import { prisma } from '@/lib/prisma'
import nextAuthOptions from '../api/auth/[...nextauth]'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const authOptions = nextAuthOptions as NextAuthOptions

interface Mietobjekt {
  id: string
  adresse: string
  zimmer: number
  flaeche: number
  gesamtMiete: number
  status: string
}

export default function Mietobjekte({ mietobjekte }: { mietobjekte: Mietobjekt[] }) {
  const router = useRouter()
  const { status } = router.query
  
  const [suchbegriff, setSuchbegriff] = useState('')
  const [statusFilter, setStatusFilter] = useState(status === 'frei' ? 'FREI' : 'ALLE')
  const [sortierung, setSortierung] = useState('adresse')

  // Setzt den Filter basierend auf den URL-Parametern
  useEffect(() => {
    if (status === 'frei') {
      setStatusFilter('FREI')
    }
  }, [status])

  // Filtern und Sortieren
  const gefilterteMietobjekte = mietobjekte
    .filter(obj => {
      // Suchfilter
      if (suchbegriff && !obj.adresse.toLowerCase().includes(suchbegriff.toLowerCase())) {
        return false
      }
      // Statusfilter
      if (statusFilter !== 'ALLE' && obj.status !== statusFilter) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      switch(sortierung) {
        case 'adresse':
          return a.adresse.localeCompare(b.adresse)
        case 'miete_ab':
          return a.gesamtMiete - b.gesamtMiete
        case 'miete_auf':
          return b.gesamtMiete - a.gesamtMiete
        case 'zimmer':
          return a.zimmer - b.zimmer
        default:
          return 0
      }
    })

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'FREI':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Frei</span>
      case 'VERMIETET':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Vermietet</span>
      case 'INSTANDHALTUNG':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Instandhaltung</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mietobjekte</h1>
        <Link href="/mietobjekte/neu">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Neu
          </button>
        </Link>
      </div>
      
      {/* Filter und Suche */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Suchfeld */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Suche</label>
            <input
              type="text"
              placeholder="Adresse eingeben..."
              value={suchbegriff}
              onChange={(e) => setSuchbegriff(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="ALLE">Alle</option>
              <option value="FREI">Frei</option>
              <option value="VERMIETET">Vermietet</option>
              <option value="INSTANDHALTUNG">Instandhaltung</option>
            </select>
          </div>

          {/* Sortierung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sortieren nach</label>
            <select
              value={sortierung}
              onChange={(e) => setSortierung(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="adresse">Adresse (A-Z)</option>
              <option value="miete_auf">Miete (höchste zuerst)</option>
              <option value="miete_ab">Miete (niedrigste zuerst)</option>
              <option value="zimmer">Zimmer</option>
            </select>
          </div>
        </div>

        {/* Anzahl Ergebnisse und Reset */}
        <div className="mt-2 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {gefilterteMietobjekte.length} von {mietobjekte.length} Mietobjekte
          </span>
          <button
            onClick={() => {
              setSuchbegriff('')
              setStatusFilter('ALLE')
              setSortierung('adresse')
              router.push('/mietobjekte')
            }}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
          >
            Filter zurücksetzen
          </button>
        </div>
      </div>
      
      {/* Tabelle */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adresse</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zimmer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fläche</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Miete</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {gefilterteMietobjekte.length > 0 ? (
              gefilterteMietobjekte.map((obj) => (
                <tr key={obj.id}>
                  <td className="px-6 py-4">{obj.adresse}</td>
                  <td className="px-6 py-4">{obj.zimmer}</td>
                  <td className="px-6 py-4">{obj.flaeche} m²</td>
                  <td className="px-6 py-4">{obj.gesamtMiete} €</td>
                  <td className="px-6 py-4">{getStatusBadge(obj.status)}</td>
                  <td className="px-6 py-4">
                    <Link href={`/mietobjekte/${obj.id}`}>
                      <button className="text-blue-600 hover:underline text-sm">
                        Details
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-4 text-gray-500 text-center" colSpan={6}>
                  Keine Mietobjekte gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  
  if (!session) {
    return {
      redirect: {
        destination: '/auth/anmelden',
        permanent: false,
      },
    }
  }

  const mietobjekte = await prisma.mietobjekt.findMany({
    orderBy: { erstellDatum: 'desc' }
  })

  return {
    props: {
      mietobjekte: JSON.parse(JSON.stringify(mietobjekte))
    },
  }
}