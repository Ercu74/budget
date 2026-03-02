import { Adresse } from './types'

interface AdresFilterProps {
  adresler: Adresse[]
  selectedAdresse: string
  onAdresseChange: (adresseId: string) => void
  nurAktiv: boolean
  onNurAktivChange: (value: boolean) => void
  nurInaktiv: boolean
  onNurInaktivChange: (value: boolean) => void
  nurMitPdf: boolean
  onNurMitPdfChange: (value: boolean) => void
  onReset: () => void
}

export default function AdresFilter({
  adresler,
  selectedAdresse,
  onAdresseChange,
  nurAktiv,
  onNurAktivChange,
  nurInaktiv,
  onNurInaktivChange,
  nurMitPdf,
  onNurMitPdfChange,
  onReset
}: AdresFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow p-3 md:p-4 mb-4 md:mb-6">  {/* Mobil: p-3, Desktop: p-4 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">  {/* Mobilde tek kolon */}
        
        {/* Adresse filter */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Adresse filtern
          </label>
          <select
            value={selectedAdresse}
            onChange={(e) => onAdresseChange(e.target.value)}
            className="w-full border rounded px-2 md:px-3 py-1.5 md:py-2 text-sm"
          >
            <option value="">Alle Adressen</option>
            {adresler.map((adr) => (
              <option key={adr.id} value={adr.id}>
                {adr.adresse.length > 30 
                  ? adr.adresse.substring(0, 30) + '...' 
                  : adr.adresse}
              </option>
            ))}
          </select>
        </div>

        {/* Checkbox'lar - mobilde alt alta, desktop'da yanyana */}
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <label className="flex items-center space-x-2 min-h-[44px] md:min-h-0">  {/* Mobilde dokunmatik alan */}
            <input
              type="checkbox"
              checked={nurAktiv}
              onChange={(e) => onNurAktivChange(e.target.checked)}
              className="rounded border-gray-300 w-4 h-4 md:w-auto md:h-auto"
            />
            <span className="text-xs md:text-sm">Nur aktive</span>
          </label>

          <label className="flex items-center space-x-2 min-h-[44px] md:min-h-0">
            <input
              type="checkbox"
              checked={nurInaktiv}
              onChange={(e) => onNurInaktivChange(e.target.checked)}
              className="rounded border-gray-300 w-4 h-4 md:w-auto md:h-auto"
            />
            <span className="text-xs md:text-sm">Nur inaktive</span>
          </label>
        </div>

        {/* Nur mit PDF */}
        <div className="flex items-center">
          <label className="flex items-center space-x-2 min-h-[44px] md:min-h-0">
            <input
              type="checkbox"
              checked={nurMitPdf}
              onChange={(e) => onNurMitPdfChange(e.target.checked)}
              className="rounded border-gray-300 w-4 h-4 md:w-auto md:h-auto"
            />
            <span className="text-xs md:text-sm">Nur mit PDF</span>
          </label>
        </div>

        {/* Reset button - mobilde tam genişlik */}
        <div className="flex justify-end">
          <button
            onClick={onReset}
            className="w-full md:w-auto px-3 md:px-4 py-2 md:py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm min-h-[44px] md:min-h-0"
          >
            Filter zurücksetzen
          </button>
        </div>
      </div>
    </div>
  )
}