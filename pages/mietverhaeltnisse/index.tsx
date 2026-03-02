import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import { prisma } from '@/lib/prisma'
import nextAuthOptions from '../api/auth/[...nextauth]'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'

const authOptions = nextAuthOptions as NextAuthOptions

interface Mietverhaeltnis {
  id: string
  startDatum: string
  endeDatum: string | null
  status: string
  mieter: { name: string } | null // null olabilir
  mietobjekt: { adresse: string }
}

export default function Mietverhaeltnisse({ verhaeltnisse }: { verhaeltnisse: Mietverhaeltnis[] }) { // { eklendi
  const router = useRouter()
  
  const [suchbegriff, setSuchbegriff] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALLE')
  const [sortierung, setSortierung] = useState('datum_ab')

  const gefilterteVerhaeltnisse = verhaeltnisse
    .filter(v => {
      // Güvenli arama kontrolü
      const matchesSearch = 
        (v.mieter?.name?.toLowerCase() || "").includes(suchbegriff.toLowerCase()) || 
        (v.mietobjekt?.adresse?.toLowerCase() || "").includes(suchbegriff.toLowerCase())
      
      if (suchbegriff && !matchesSearch) return false
      if (statusFilter !== 'ALLE' && v.status !== statusFilter) return false
      
      return true
    })
    .sort((a, b) => {
      switch(sortierung) {
        case 'mieter':
          return (a.mieter?.name || "").localeCompare(b.mieter?.name || "")
        case 'adresse':
          return a.mietobjekt.adresse.localeCompare(b.mietobjekt.adresse)
        case 'datum_ab':
          return new Date(b.startDatum).getTime() - new Date(a.startDatum).getTime()
        case 'datum_auf':
          return new Date(a.startDatum).getTime() - new Date(b.startDatum).getTime()
        default:
          return 0
      }
    })

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'AKTIV':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktiv</span>
      case 'GEKUENDIGT':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Gekündigt</span>
      case 'BEENDET':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Beendet</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mietverhältnisse</h1>
        <Link href="/mietverhaeltnisse/neu">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold">
            Neu
          </button>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Suche</label>
            <input
              type="text"
              placeholder="Mieter oder Adresse..."
              value={suchbegriff}
              onChange={(e) => setSuchbegriff(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="ALLE">Alle</option>
              <option value="AKTIV">Aktiv</option>
              <option value="GEKUENDIGT">Gekündigt</option>
              <option value="BEENDET">Beendet</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sortieren nach</label>
            <select
              value={sortierung}
              onChange={(e) => setSortierung(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="datum_ab">Datum (Neueste zuerst)</option>
              <option value="datum_auf">Datum (Älteste zuerst)</option>
              <option value="mieter">Mieter Name (A-Z)</option>
              <option value="adresse">Adresse (A-Z)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSuchbegriff('')
                setStatusFilter('ALLE')
                setSortierung('datum_ab')
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 w-full"
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mieter</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Objekt</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beginn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ende</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {gefilterteVerhaeltnisse.length > 0 ? (
              gefilterteVerhaeltnisse.map((v) => (
                <tr key={v.id}>
                  {/* Güvenli Mieter ismi okuma */}
                  <td className="px-6 py-4 font-medium">{v.mieter?.name || "Kein Mieter"}</td>
                  <td className="px-6 py-4">{v.mietobjekt?.adresse}</td>
                  <td className="px-6 py-4">{new Date(v.startDatum).toLocaleDateString('de-DE')}</td>
                  <td className="px-6 py-4">{v.endeDatum ? new Date(v.endeDatum).toLocaleDateString('de-DE') : '-'}</td>
                  <td className="px-6 py-4">{getStatusBadge(v.status)}</td>
                  <td className="px-6 py-4">
                    <Link href={`/mietverhaeltnisse/${v.id}`}>
                      <button className="text-blue-600 hover:underline text-sm font-medium">Details</button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-4 text-center text-gray-500" colSpan={6}>
                  Keine Mietverhältnisse gefunden.
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
    return { redirect: { destination: '/auth/anmelden', permanent: false } }
  }

  const verhaeltnisse = await prisma.mietverhaeltnis.findMany({
    include: {
      mieter: { select: { name: true } },
      mietobjekt: { select: { adresse: true } }
    },
    orderBy: { startDatum: 'desc' }
  })

  return {
    props: {
      verhaeltnisse: JSON.parse(JSON.stringify(verhaeltnisse))
    },
  }
}