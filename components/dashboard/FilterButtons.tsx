interface FilterButtonsProps {
  showNurUeberfaellig: boolean
  setShowNurUeberfaellig: (value: boolean) => void
  showNurBaldAblaufend: boolean
  setShowNurBaldAblaufend: (value: boolean) => void
}

export default function FilterButtons({ 
  showNurUeberfaellig, 
  setShowNurUeberfaellig,
  showNurBaldAblaufend,
  setShowNurBaldAblaufend
}: FilterButtonsProps) {
  return (
    <div className="flex gap-4 mb-4">
      <button
        onClick={() => setShowNurUeberfaellig(!showNurUeberfaellig)}
        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
          showNurUeberfaellig 
            ? 'bg-red-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {showNurUeberfaellig ? 'Alle anzeigen' : 'Nur überfällige anzeigen'}
      </button>
      <button
        onClick={() => setShowNurBaldAblaufend(!showNurBaldAblaufend)}
        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
          showNurBaldAblaufend 
            ? 'bg-yellow-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {showNurBaldAblaufend ? 'Alle anzeigen' : 'Nur bald endende (≤30 Tage)'}
      </button>
    </div>
  )
}
