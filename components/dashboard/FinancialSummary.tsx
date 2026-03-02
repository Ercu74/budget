import { DashboardProps } from './types'

export default function FinancialSummary({ 
  erhalteneZahlungen, 
  offeneForderungen, 
  sollMiete 
}: DashboardProps) {
  
  const erhaltenPercent = sollMiete > 0 ? (erhalteneZahlungen / sollMiete) * 100 : 0
  const offenPercent = sollMiete > 0 ? (offeneForderungen / sollMiete) * 100 : 0

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Finanzielle Übersicht</h2>
      
      <div className="space-y-6">
        {/* İlerleme Çubuğu */}
        <div>
          <div className="flex justify-between mb-2 text-sm font-medium">
            <span className="text-gray-600">Bezahlt vs. Offen</span>
            <span className="text-gray-900">{erhaltenPercent.toFixed(1)}% / {offenPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 flex overflow-hidden">
            <div 
              className="bg-green-500 h-full transition-all duration-500" 
              style={{ width: `${erhaltenPercent}%` }}
            />
            <div 
              className="bg-red-500 h-full transition-all duration-500" 
              style={{ width: `${offenPercent}%` }}
            />
          </div>
        </div>

        {/* Özet Rakamlar */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase font-semibold">Soll-Miete</p>
            <p className="text-xl font-bold text-gray-900">
              {sollMiete.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase font-semibold">Erhalten</p>
            <p className="text-xl font-bold text-green-600">
              {erhalteneZahlungen.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase font-semibold">Offen</p>
            <p className="text-xl font-bold text-red-600">
              {offeneForderungen.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
        </div>
      </div>
      {/* Tablo kodları buradan itibaren tamamen silindi, artık asla görünmeyecekler */}
    </div>
  )
}