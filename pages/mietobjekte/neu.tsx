import { useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import nextAuthOptions from '../api/auth/[...nextauth]'

const authOptions = nextAuthOptions as NextAuthOptions

export default function MietobjektNeu() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    adresse: '',
    zimmer: '',
    flaeche: '',
    kaltMiete: '',
    nebenkosten: '',
    status: 'FREI',
    bemerkungen: '',
    mieterName: '' // Hier gibst du den Namen direkt ein (z.B. "ercü")
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/mietobjekte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          zimmer: parseInt(formData.zimmer),
          flaeche: parseFloat(formData.flaeche),
          kaltMiete: parseFloat(formData.kaltMiete),
          nebenkosten: parseFloat(formData.nebenkosten || '0'),
          gesamtMiete: parseFloat(formData.kaltMiete) + parseFloat(formData.nebenkosten || '0')
        })
      })
      
      if (res.ok) {
        router.push('/mietobjekte')
      } else {
        alert('Fehler beim Speichern des Objekts')
      }
    } catch (error) {
      alert('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Neues Mietobjekt anlegen</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md border border-gray-100">
        
        {/* MIETER NAME INPUT */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mieter Name</label>
          <input
            type="text"
            placeholder="Name des Mieters eingeben"
            value={formData.mieterName}
            onChange={(e) => setFormData({...formData, mieterName: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse *</label>
          <input
            type="text"
            required
            placeholder="Straße, Hausnummer, PLZ"
            value={formData.adresse}
            onChange={(e) => setFormData({...formData, adresse: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Zimmeranzahl *</label>
            <input 
              type="number" 
              required 
              value={formData.zimmer} 
              onChange={(e) => setFormData({...formData, zimmer: e.target.value})} 
              className="w-full border border-gray-300 rounded-md px-3 py-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Wohnfläche (m²) *</label>
            <input 
              type="number" 
              required 
              step="0.1" 
              value={formData.flaeche} 
              onChange={(e) => setFormData({...formData, flaeche: e.target.value})} 
              className="w-full border border-gray-300 rounded-md px-3 py-2" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Kaltmiete (€) *</label>
            <input 
              type="number" 
              required 
              step="0.01" 
              value={formData.kaltMiete} 
              onChange={(e) => setFormData({...formData, kaltMiete: e.target.value})} 
              className="w-full border border-gray-300 rounded-md px-3 py-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nebenkosten (€)</label>
            <input 
              type="number" 
              step="0.01" 
              value={formData.nebenkosten} 
              onChange={(e) => setFormData({...formData, nebenkosten: e.target.value})} 
              className="w-full border border-gray-300 rounded-md px-3 py-2" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Objekt-Status</label>
          <select 
            value={formData.status} 
            onChange={(e) => setFormData({...formData, status: e.target.value})} 
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="FREI">Frei / Verfügbar</option>
            <option value="VERMIETET">Vermietet</option>
            <option value="INSTANDHALTUNG">Instandhaltung</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-all"
          >
            Abbrechen
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
          >
            {loading ? 'Wird gespeichert...' : 'Objekt speichern'}
          </button>
        </div>
      </form>
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