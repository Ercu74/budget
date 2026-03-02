import { useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import nextAuthOptions from '../api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

const authOptions = nextAuthOptions as NextAuthOptions

// Sayfaya mülkler prop olarak geliyor
export default function MietverhaeltnisNeu({ mietobjekte }: { mietobjekte: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    mietobjektId: '', // Seçilen mülkün ID'si için alan
    mieterName: '',
    adresse: '',
    kaltMiete: '',
    nebenkosten: '',
    beginnDatum: '',
    status: 'AKTIV'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/mietverhaeltnisse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          kaltMiete: parseFloat(formData.kaltMiete || '0'),
          nebenkosten: parseFloat(formData.nebenkosten || '0')
        })
      })
      
      if (res.ok) {
        router.push('/mietverhaeltnisse')
      } else {
        alert('Fehler beim Speichern')
      }
    } catch (error) {
      alert('Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">Neues Mietverhältnis</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        {/* MÜLK SEÇİM ALANI */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Mietobjekt auswählen *</label>
          <select
            required
            value={formData.mietobjektId}
            onChange={(e) => {
              const selectedId = e.target.value;
              const selectedObj = mietobjekte.find(m => m.id === selectedId);
              // Seçim yapıldığında diğer alanları otomatik doldurur
              setFormData({
                ...formData,
                mietobjektId: selectedId,
                adresse: selectedObj?.adresse || '',
                kaltMiete: selectedObj?.kaltMiete?.toString() || '',
                nebenkosten: selectedObj?.nebenkosten?.toString() || ''
              });
            }}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 shadow-sm transition-all"
          >
            <option value="">-- Bitte ein Objekt wählen --</option>
            {mietobjekte.map((obj) => (
              <option key={obj.id} value={obj.id}>
                {obj.adresse} ({obj.status})
              </option>
            ))}
          </select>
        </div>

        {/* MIETER NAME - Backend'e giden asıl isim alanı */}
        <div>
          <label htmlFor="mieterName" className="block text-sm font-bold text-gray-700 mb-2">Mieter Name (Optional)</label>
          <input
            id="mieterName"
            type="text"
            name="mieterName"
            placeholder="Name des Mieters eingeben"
            value={formData.mieterName}
            onChange={(e) => setFormData({...formData, mieterName: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-900 shadow-sm"
          />
        </div>

        {/* ADRESSE - Otomatik doluyor */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Objekt Adresse *</label>
          <input
            type="text"
            required
            placeholder="z.B. Rosa Jochman Ring"
            value={formData.adresse}
            onChange={(e) => setFormData({...formData, adresse: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>

        {/* KALTMIETE & NEBENKOSTEN */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Kaltmiete (€) *</label>
            <input 
              type="number" 
              required 
              step="0.01"
              placeholder="0.00"
              value={formData.kaltMiete} 
              onChange={(e) => setFormData({...formData, kaltMiete: e.target.value})} 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nebenkosten (€)</label>
            <input 
              type="number" 
              step="0.01"
              placeholder="0.00"
              value={formData.nebenkosten} 
              onChange={(e) => setFormData({...formData, nebenkosten: e.target.value})} 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm" 
            />
          </div>
        </div>

        {/* VERTRAGSBEGINN */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Vertragsbeginn</label>
          <input 
            type="date" 
            value={formData.beginnDatum} 
            onChange={(e) => setFormData({...formData, beginnDatum: e.target.value})} 
            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" 
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all"
          >
            Abbrechen
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-bold shadow-md transition-all"
          >
            {loading ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </form>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session) return { redirect: { destination: '/auth/anmelden', permanent: false } }

  const mietobjekte = await prisma.mietobjekt.findMany({
    orderBy: { adresse: 'asc' }
  })

  return { 
    props: { 
      mietobjekte: JSON.parse(JSON.stringify(mietobjekte)) 
    } 
  }
}