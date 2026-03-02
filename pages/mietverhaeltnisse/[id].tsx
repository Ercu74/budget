import { useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import { prisma } from '@/lib/prisma'
import nextAuthOptions from '../api/auth/[...nextauth]'
import Link from 'next/link'

const authOptions = nextAuthOptions as NextAuthOptions

interface Mietverhaeltnis {
  id: string
  startDatum: string
  endeDatum: string | null
  kaution: number | null
  status: string
  mieter: {
    id: string
    name: string
    email: string
    telefon: string | null
  } | null
  mietobjekt: {
    id: string
    adresse: string
    kaltMiete: number
    nebenkosten: number
    gesamtMiete: number
  }
}

export default function MietverhaeltnisDetails({ vertrag }: { vertrag: Mietverhaeltnis }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    status: vertrag.status,
    startDatum: vertrag.startDatum.split('T')[0],
    endeDatum: vertrag.endeDatum ? vertrag.endeDatum.split('T')[0] : '',
    kaution: vertrag.kaution?.toString() || '',
    mieterName: vertrag.mieter?.name || ''
  })

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/mietverhaeltnisse/${vertrag.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })
      if (res.ok) {
        setIsEditing(false)
        router.replace(router.asPath)
      } else {
        alert('Fehler beim Aktualisieren')
      }
    } catch (error) {
      alert('Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Dieses Mietverhältnis wirklich löschen?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/mietverhaeltnisse/${vertrag.id}`, { method: 'DELETE' })
      if (res.ok) router.push('/mietverhaeltnisse')
    } catch (error) {
      alert('Fehler beim Löschen')
    } finally {
      setLoading(false)
    }
  }

  if (isEditing) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Mietverhältnis bearbeiten</h1>
        <form onSubmit={handleUpdate} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium mb-1">Mieter Name</label>
            <input
              type="text"
              value={editData.mieterName}
              onChange={(e) => setEditData({ ...editData, mieterName: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="AKTIV">Aktiv</option>
                <option value="GEKUENDIGT">Gekündigt</option>
                <option value="BEENDET">Beendet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kaution (€)</label>
              <input
                type="number"
                step="0.01"
                value={editData.kaution}
                onChange={(e) => setEditData({ ...editData, kaution: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Startdatum</label>
              <input
                type="date"
                value={editData.startDatum}
                onChange={(e) => setEditData({ ...editData, startDatum: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Endedatum</label>
              <input
                type="date"
                value={editData.endeDatum}
                onChange={(e) => setEditData({ ...editData, endeDatum: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <Link href="/mietverhaeltnisse" className="text-blue-600 hover:underline text-sm mb-2 block">
            ← Zurück zur Übersicht
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Mietverhältnis Details</h1>
          <p className="text-gray-500 mt-1">ID: {vertrag.id}</p>
        </div>
        <div className="flex gap-3">
          {/* 🔥 SADECE BURASI DEĞİŞTİ - Link ile bearbeiten sayfasına yönlendiriyor */}
          <Link href={`/mietverhaeltnisse/${vertrag.id}/bearbeiten`}>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              Bearbeiten
            </button>
          </Link>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded shadow-sm text-sm font-medium hover:bg-red-100 disabled:opacity-50"
          >
            Löschen
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Haupt-Informationen */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
              <h2 className="font-bold text-gray-800">Vertragsdaten</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-6">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold mt-1 ${
                  vertrag.status === 'AKTIV' ? 'bg-green-100 text-green-800' : 
                  vertrag.status === 'GEKUENDIGT' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {vertrag.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Kaution</p>
                <p className="font-medium">{vertrag.kaution ? `${vertrag.kaution.toLocaleString('de-DE')} €` : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vertragsbeginn</p>
                <p className="font-medium">{new Date(vertrag.startDatum).toLocaleDateString('de-DE')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vertragsende</p>
                <p className="font-medium">{vertrag.endeDatum ? new Date(vertrag.endeDatum).toLocaleDateString('de-DE') : 'Unbefristet'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
              <h2 className="font-bold text-gray-800">Mietobjekt</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500">Adresse</p>
              <p className="text-lg font-medium mb-4">{vertrag.mietobjekt.adresse}</p>
              <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-xs text-blue-600 uppercase font-bold">Kaltmiete</p>
                  <p className="text-lg font-bold text-blue-900">{vertrag.mietobjekt.kaltMiete.toLocaleString('de-DE')} €</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 uppercase font-bold">Nebenkosten</p>
                  <p className="text-lg font-bold text-blue-900">{vertrag.mietobjekt.nebenkosten.toLocaleString('de-DE')} €</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 uppercase font-bold">Gesamt</p>
                  <p className="text-lg font-bold text-blue-900">{vertrag.mietobjekt.gesamtMiete.toLocaleString('de-DE')} €</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mieter Bilgisi */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
              <h2 className="font-bold text-gray-800">Parteien</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm text-gray-500">Mieter</p>
                <p className="font-medium">{vertrag.mieter?.name || vertrag.mieter?.email || "Kein Mieter zugeordnet"}</p>
                {vertrag.mieter?.telefon && (
                  <p className="text-sm text-gray-600">📞 {vertrag.mieter.telefon}</p>
                )}
              </div>
              <div className="pt-4 border-t border-gray-50">
                <p className="text-sm text-gray-500">Vermieter</p>
                <p className="font-medium">Admin (Eigentümer)</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="font-bold mb-2">Zahlungsstatus</h3>
            <p className="text-blue-100 text-sm mb-4">Aktueller Status der Mietzahlungen für dieses Objekt.</p>
            <div className="text-2xl font-bold">Pünktlich</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session) return { redirect: { destination: '/auth/anmelden', permanent: false } }

  const { id } = context.params!
  const vertrag = await prisma.mietverhaeltnis.findUnique({
    where: { id: String(id) },
    include: {
      mieter: true,
      mietobjekt: true
    }
  })

  if (!vertrag) return { notFound: true }

  return {
    props: {
      vertrag: JSON.parse(JSON.stringify(vertrag))
    }
  }
}