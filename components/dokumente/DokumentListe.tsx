import { useState } from 'react'

interface Dokument {
  id: string
  name: string
  url: string
  type: string | null
  erstellDatum: string
}

interface DokumentListeProps {
  dokumente: Dokument[]
  mietverhaeltnisId: string
  onDelete: () => void
}

export default function DokumentListe({ dokumente, mietverhaeltnisId, onDelete }: DokumentListeProps) {
  const [loeschenId, setLoeschenId] = useState<string | null>(null)

  const handleDelete = async (dokumentId: string) => {
    if (!confirm('Dokument wirklich löschen?')) return

    setLoeschenId(dokumentId)
    try {
      const res = await fetch(`/api/dokumente/${dokumentId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        onDelete()
      } else {
        alert('Löschen fehlgeschlagen')
      }
    } catch (error) {
      alert('Fehler beim Löschen')
    } finally {
      setLoeschenId(null)
    }
  }

  if (dokumente.length === 0) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500 italic text-sm">Keine Dokumente vorhanden</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {dokumente.map((doc) => (
        <div 
          key={doc.id} 
          className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📄</span>
            <div>
              <p className="font-medium text-sm">{doc.name}</p>
              <p className="text-xs text-gray-500">
                {new Date(doc.erstellDatum).toLocaleDateString('de-DE')}
                {doc.type && ` • ${doc.type}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-xs"
            >
              Ansehen
            </a>
            <button
              onClick={() => handleDelete(doc.id)}
              disabled={loeschenId === doc.id}
              className="px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-xs disabled:opacity-50"
            >
              {loeschenId === doc.id ? '...' : 'Löschen'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}