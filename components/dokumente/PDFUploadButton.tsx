import { useState } from 'react'

interface PDFUploadButtonProps {
  mietverhaeltnisId: string
  onUploadSuccess: () => void
}

export default function PDFUploadButton({ 
  mietverhaeltnisId, 
  onUploadSuccess 
}: PDFUploadButtonProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert('Bitte nur PDF-Dateien hochladen')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Datei zu gross (max. 10MB)')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mietverhaeltnisId', mietverhaeltnisId)
    formData.append('dokumentName', file.name)

    try {
      const res = await fetch('/api/dokumente', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        onUploadSuccess()
        alert('PDF erfolgreich hochgeladen!')
      } else {
        const data = await res.json()
        alert(data.message || 'Upload fehlgeschlagen')
      }
    } catch (error) {
      alert('Fehler beim Upload')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
        id={`pdf-upload-${mietverhaeltnisId}`}
      />
      <label
        htmlFor={`pdf-upload-${mietverhaeltnisId}`}
        className={`
          cursor-pointer px-3 py-1.5 rounded font-bold text-sm
          flex items-center justify-center min-h-[44px]
          ${uploading 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-green-50 text-green-600 hover:bg-green-100'
          }
        `}
      >
        {uploading ? '📤 Uploading...' : '📄 PDF uploaden'}
      </label>
    </div>
  )
}