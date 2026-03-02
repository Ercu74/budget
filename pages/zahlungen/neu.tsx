import { useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import nextAuthOptions from '../api/auth/[...nextauth]'

export default function ZahlungNeu({ mietverhaeltnisse }: { mietverhaeltnisse: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    mietverhaeltnisId: '',
    betrag: '',
    zahlungsdatum: new Date().toISOString().split('T')[0],
    methode: 'UBERWEISUNG',
    status: 'AUSSTEHEND',
    bemerkungen: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!formData.mietverhaeltnisId) return alert("Lütfen bir sözleşme seçin")
    setLoading(true)
    
    const res = await fetch('/api/zahlungen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    
    if (res.ok) {
      router.push('/zahlungen')
    } else {
      const err = await res.json()
      alert('Hata: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow rounded-lg border border-gray-200 mt-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Neue Zahlung erfassen</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Mietverhältnis (Sözleşme)</label>
          <select 
            className="w-full border p-2 rounded bg-white"
            value={formData.mietverhaeltnisId}
            onChange={(e) => setFormData({...formData, mietverhaeltnisId: e.target.value})}
            required
          >
            <option value="">-- Bitte wählen --</option>
            {mietverhaeltnisse.map((m) => (
              <option key={m.id} value={m.id}>
                {m.mietobjekt.adresse} - {m.mieter.name || m.mieter.email}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Betrag (€)</label>
            <input type="number" step="0.01" className="w-full border p-2 rounded" 
              value={formData.betrag} onChange={(e) => setFormData({...formData, betrag: e.target.value})} required />
          </div>
          <div>
            <label className="block font-medium mb-1">Datum</label>
            <input type="date" className="w-full border p-2 rounded" 
              value={formData.zahlungsdatum} onChange={(e) => setFormData({...formData, zahlungsdatum: e.target.value})} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Methode</label>
            <select className="w-full border p-2 rounded bg-white" value={formData.methode} onChange={(e) => setFormData({...formData, methode: e.target.value})}>
              <option value="UBERWEISUNG">Überweisung</option>
              <option value="BAR">Bar</option>
              <option value="DAUERAUFTRAG">Dauerauftrag</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Status</label>
            <select className="w-full border p-2 rounded bg-white" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
              <option value="BEZAHLT">Erhalten</option>
              <option value="AUSSTEHEND">Ausstehend</option>
              <option value="UEBERFAELLIG">Überfällig</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button type="submit" disabled={loading} className="bg-[#1a237e] text-white px-8 py-2 rounded font-bold hover:bg-blue-900 disabled:opacity-50">
            {loading ? 'Speichern...' : 'Speichern'}
          </button>
          <button type="button" onClick={() => router.back()} className="bg-gray-200 text-gray-700 px-8 py-2 rounded font-bold">
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, nextAuthOptions as any)
  if (!session) return { redirect: { destination: '/auth/anmelden', permanent: false } }

  const mietverhaeltnisse = await prisma.mietverhaeltnis.findMany({
    where: { status: 'AKTIV' },
    include: { mietobjekt: true, mieter: true }
  })

  return { props: { mietverhaeltnisse: JSON.parse(JSON.stringify(mietverhaeltnisse)) } }
}
