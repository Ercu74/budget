import Link from 'next/link'

export default function QuickActions() {
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200 mb-8">
      <h3 className="text-sm font-medium text-gray-500 mb-3">⚡ Quick Actions</h3>
      <div className="grid grid-cols-4 gap-2">
        <Link href="/mietobjekte/neu">
          <button className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
            + Mietobjekt
          </button>
        </Link>
        <Link href="/mietverhaeltnisse/neu">
          <button className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
            + Mietverhältnis
          </button>
        </Link>
        <Link href="/zahlungen/neu">
          <button className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
            + Zahlung
          </button>
        </Link>
        <Link href="/dokumente">
          <button className="w-full px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm">
            📄 Dokumente / Mieter
          </button>
        </Link>
      </div>
    </div>
  )
}