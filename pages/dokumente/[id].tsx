import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import { prisma } from '@/lib/prisma'
import nextAuthOptions from '../api/auth/[...nextauth]'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Link from 'next/link'

const authOptions = nextAuthOptions as NextAuthOptions

interface KiraciDetail {
  id: string
  name: string | null
  email: string | null
  telefon: string | null
  vertragUrl: string | null
  mietverhaeltnis: {
    id: string
    status: string
    startDatum: string
    endeDatum: string | null
    mietobjekt: {
      adresse: string
    }
  }
}

export default function KiraciDokumentPage({ kiraci }: { kiraci: KiraciDetail }) {
  const router = useRouter()
  const { upload } = router.query
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes('pdf')) {
      alert('Nur PDF Dateien sind erlaubt')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mietverhaeltnisId', kiraci.mietverhaeltnis.id)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        alert('PDF erfolgreich hochgeladen')
        router.push(`/dokumente/${kiraci.id}`)
      } else {
        alert('Fehler beim Hochladen')
      }
    } catch (error) {
      alert('Ein Fehler ist aufgetreten')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dokumente</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Zurück
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{kiraci.name || 'İsimsiz'}</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Adresse</p>
            <p className="font-medium">{kiraci.mietverhaeltnis.mietobjekt.adresse}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                kiraci.mietverhaeltnis.status === 'AKTIV' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {kiraci.mietverhaeltnis.status}
              </span>
            </p>
          </div>
          {kiraci.email && (
            <div>
              <p className="text-sm text-gray-500">E-Mail</p>
              <p className="font-medium">{kiraci.email}</p>
            </div>
          )}
          {kiraci.telefon && (
            <div>
              <p className="text-sm text-gray-500">Telefon</p>
              <p className="font-medium">{kiraci.telefon}</p>
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Vertragsdokument</h3>
          
          {upload === 'true' ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploading && <p className="text-sm text-blue-600 mt-2">Yükleniyor...</p>}
            </div>
          ) : (
            <div>
              {kiraci.vertragUrl ? (
                <div className="flex items-center gap-4">
                  <a
                    href={kiraci.vertragUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    📄 PDF anzeigen
                  </a>
                  <Link href={`/dokumente/${kiraci.id}?upload=true`}>
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm">
                      PDF ersetzen
                    </button>
                  </Link>
                </div>
              ) : (
                <Link href={`/dokumente/${kiraci.id}?upload=true`}>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    PDF hochladen
                  </button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  
  if (!session) {
    return {
      redirect: {
        destination: '/auth/anmelden',
        permanent: false,
      },
    }
  }

  const id = context.params?.id as string

  const mieter = await prisma.benutzer.findUnique({
    where: { id },
    include: {
      mieterMietverhaeltnisse: {
        include: {
          mietobjekt: true
        },
        take: 1
      }
    }
  })

  if (!mieter || mieter.mieterMietverhaeltnisse.length === 0) {
    return { notFound: true }
  }

  const mietverhaeltnis = mieter.mieterMietverhaeltnisse[0]

  return {
    props: {
      kiraci: JSON.parse(JSON.stringify({
        id: mieter.id,
        name: mieter.name,
        email: mieter.email,
        telefon: mieter.telefon,
        vertragUrl: mietverhaeltnis.vertragUrl,
        mietverhaeltnis: {
          id: mietverhaeltnis.id,
          status: mietverhaeltnis.status,
          startDatum: mietverhaeltnis.startDatum,
          endeDatum: mietverhaeltnis.endeDatum,
          mietobjekt: mietverhaeltnis.mietobjekt
        }
      }))
    },
  }
}
