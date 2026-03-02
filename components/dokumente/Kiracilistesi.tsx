import { Kiraci } from './types'
import PDFUploadButton from './PDFUploadButton'
import { useState, useEffect } from 'react'
import DokumentListe from './DokumentListe'

interface MieterListeProps {
  mieterListe: Kiraci[]; 
  onDelete: (mieterId: string) => Promise<void>;
  onUploadSuccess: () => void;  // 🔥 EKLENDİ
  mietverhaeltnisMap: Record<string, string>;
}

export default function MieterListe({ 
  mieterListe, 
  onDelete,
  onUploadSuccess,  // 🔥 EKLENDİ
  mietverhaeltnisMap 
}: MieterListeProps) {
  const [dokumenteMap, setDokumenteMap] = useState<Record<string, any[]>>({})
  const [aktiverMieter, setAktiverMieter] = useState<string | null>(null)

  // Dokümanları yükle
  const loadDokumente = async (mietverhaeltnisId: string, mieterId: string) => {
    try {
      const res = await fetch(`/api/dokumente?mietverhaeltnisId=${mietverhaeltnisId}`)
      const data = await res.json()
      setDokumenteMap(prev => ({ ...prev, [mieterId]: data }))
    } catch (error) {
      console.error('Dokümanlar yüklenirken hata:', error)
    }
  }

  // Upload sonrası dokümanları yenile
  const handleUploadSuccess = async (mieterId: string) => {
    const mietverhaeltnisId = mietverhaeltnisMap[mieterId]
    if (mietverhaeltnisId) {
      await loadDokumente(mietverhaeltnisId, mieterId)
      onUploadSuccess()  // 🔥 Ana sayfaya bildir
    }
  }

  // İlk yüklemede tüm dokümanları çek
  useEffect(() => {
    mieterListe.forEach(async (mieter) => {
      const mietverhaeltnisId = mietverhaeltnisMap[mieter.id]
      if (mietverhaeltnisId && !dokumenteMap[mieter.id]) {
        await loadDokumente(mietverhaeltnisId, mieter.id)
      }
    })
  }, [mieterListe, mietverhaeltnisMap])

  return (
    <div className="space-y-4">
      {mieterListe.map((mieter) => {
        const mietverhaeltnisId = mietverhaeltnisMap[mieter.id]
        const dokumente = dokumenteMap[mieter.id] || []
        
        return (
          <div key={mieter.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            {/* ÜST KISIM - MİETER BİLGİLERİ */}
            <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg">{mieter.name || 'Unbekannt'}</h3>
                <div className="text-sm text-gray-600">{mieter.email}</div>
                <div className="text-sm text-gray-500">{mieter.mietobjektAdresse}</div>
                {mieter.status && (
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                    mieter.status === 'AKTIV' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {mieter.status}
                  </span>
                )}
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                {mietverhaeltnisId && (
                  <PDFUploadButton 
                    mietverhaeltnisId={mietverhaeltnisId}
                    onUploadSuccess={() => handleUploadSuccess(mieter.id)}
                  />
                )}
                <button
                  onClick={() => onDelete(mieter.id)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-bold min-w-[80px]"
                >
                  Löschen
                </button>
                <button
                  onClick={() => setAktiverMieter(aktiverMieter === mieter.id ? null : mieter.id)}
                  className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 text-sm min-w-[80px]"
                >
                  {aktiverMieter === mieter.id ? '▼' : '▶'} Dokümanlar
                </button>
              </div>
            </div>

            {/* ALT KISIM - DOKÜMAN LİSTESİ (toggle) */}
            {aktiverMieter === mieter.id && mietverhaeltnisId && (
              <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                <DokumentListe 
                  dokumente={dokumente}
                  mietverhaeltnisId={mietverhaeltnisId}
                  onDelete={() => loadDokumente(mietverhaeltnisId, mieter.id)}
                />
              </div>
            )}
          </div>
        )
      })}
      
      {mieterListe.length === 0 && (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500 italic">Keine Mieter gefunden.</p>
        </div>
      )}
    </div>
  )
}