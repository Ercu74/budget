import Link from 'next/link'
import { DashboardProps } from './types'

interface WarningCardsProps {
  data: DashboardProps
  showNurUeberfaellig: boolean
  showNurBaldAblaufend: boolean
}

export default function WarningCards({ 
  data, 
  showNurUeberfaellig, 
  showNurBaldAblaufend 
}: WarningCardsProps) {
  
  // Filtrelenmiş veriler
  const gefilterteVadesiGecmis = showNurUeberfaellig 
    ? data.vadesiGecmisOdemeler.filter(o => o.tageUeberfaellig > 0)
    : data.vadesiGecmisOdemeler

  const gefilterteBaldAblaufend = showNurBaldAblaufend
    ? data.baldAblaufendeVertraege.filter(v => v.tageBisEnde <= 30)
    : data.baldAblaufendeVertraege

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      {/* Vadesi Geçmiş Ödemeler */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-red-600">⚠️ Überfällige Zahlungen</h2>
          <Link href="/zahlungen">
            <button className="text-sm text-blue-600 hover:underline">
              Alle anzeigen
            </button>
          </Link>
        </div>
        
        {gefilterteVadesiGecmis.length > 0 ? (
          <div className="space-y-3">
            {gefilterteVadesiGecmis.map((zahlung) => (
              <div key={zahlung.id} className="border-b pb-2 last:border-0">
                <div className="flex justify-between">
                  <Link href={`/zahlungen/${zahlung.id}`}>
                    <span className="font-medium hover:text-blue-600 cursor-pointer">
                      {zahlung.mietobjekt}
                    </span>
                  </Link>
                  <span className="text-red-600 font-bold">
                    {zahlung.tageUeberfaellig} Tage
                  </span>
                </div>
                <div className="text-sm text-gray-600 flex justify-between">
                  <span>{zahlung.mieter}</span>
                  <span className="font-medium">{zahlung.betrag} €</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Keine überfälligen Zahlungen
          </p>
        )}
      </div>

      {/* Bald ablaufende Verträge */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-yellow-600">📅 Bald ablaufende Verträge</h2>
          <Link href="/mietverhaeltnisse">
            <button className="text-sm text-blue-600 hover:underline">
              Alle anzeigen
            </button>
          </Link>
        </div>
        
        {gefilterteBaldAblaufend.length > 0 ? (
          <div className="space-y-3">
            {gefilterteBaldAblaufend.map((vertrag) => (
              <div key={vertrag.id} className="border-b pb-2 last:border-0">
                <div className="flex justify-between">
                  <Link href={`/mietverhaeltnisse/${vertrag.id}`}>
                    <span className="font-medium hover:text-blue-600 cursor-pointer">
                      {vertrag.mietobjekt}
                    </span>
                  </Link>
                  <span className={`font-bold ${
                    vertrag.tageBisEnde <= 7 ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {vertrag.tageBisEnde} Tage
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Mieter: {vertrag.mieter}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Keine bald ablaufenden Verträge
          </p>
        )}
      </div>

      {/* Leere Mietobjekte */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-blue-600">🏠 Freie Mietobjekte</h2>
          <Link href="/mietobjekte">
            <button className="text-sm text-blue-600 hover:underline">
              Alle anzeigen
            </button>
          </Link>
        </div>
        
        {data.bosMietobjekte.length > 0 ? (
          <div className="space-y-3">
            {data.bosMietobjekte.map((obj) => (
              <div key={obj.id} className="border-b pb-2 last:border-0">
                <Link href={`/mietobjekte/${obj.id}`}>
                  <div className="flex justify-between hover:text-blue-600 cursor-pointer">
                    <span className="font-medium">{obj.adresse}</span>
                    <span className="text-gray-600">{obj.gesamtMiete} €</span>
                  </div>
                </Link>
                <div className="text-sm text-gray-600">
                  {obj.zimmer} Zimmer · {obj.flaeche} m²
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Keine freien Mietobjekte
          </p>
        )}
      </div>
    </div>
  )
}
