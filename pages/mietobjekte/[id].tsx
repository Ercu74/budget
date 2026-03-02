import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import { prisma } from '@/lib/prisma'
import nextAuthOptions from '../api/auth/[...nextauth]'
import { useRouter } from 'next/router'
import Link from 'next/link'

const authOptions = nextAuthOptions as NextAuthOptions

interface MietobjektDetail {
  id: string
  adresse: string
  zimmer: number
  flaeche: number
  kaltMiete: number
  nebenkosten: number
  gesamtMiete: number
  status: string
  bemerkungen: string | null
  erstellDatum: string
  aktualisiert: string
}

export default function MietobjektDetail({ mietobjekt }: { mietobjekt: MietobjektDetail }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Sind Sie sicher?')) return
    
    try {
      const res = await fetch(`/api/mietobjekte/${mietobjekt.id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        router.push('/mietobjekte')
      } else {
        alert('Fehler beim Löschen')
      }
    } catch (error) {
      alert('Ein Fehler ist aufgetreten')
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'FREI':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Frei</span>
      case 'VERMIETET':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Vermietet</span>
      case 'INSTANDHALTUNG':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Instandhaltung</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mietobjekt Details</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Zurück
          </button>
          <Link href={`/mietobjekte/${mietobjekt.id}/bearbeiten`}>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Bearbeiten
            </button>
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Löschen
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Adresse und Status */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold">{mietobjekt.adresse}</h2>
              <p className="text-gray-500 mt-1">ID: {mietobjekt.id}</p>
            </div>
            <div>{getStatusBadge(mietobjekt.status)}</div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t pt-4">
            <div>
              <p className="text-sm text-gray-500">Zimmer</p>
              <p className="font-medium">{mietobjekt.zimmer}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fläche</p>
              <p className="font-medium">{mietobjekt.flaeche} m²</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Kaltmiete</p>
              <p className="font-medium">{mietobjekt.kaltMiete} €</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nebenkosten</p>
              <p className="font-medium">{mietobjekt.nebenkosten} €</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gesamtmiete</p>
              <p className="font-medium text-lg text-blue-600">{mietobjekt.gesamtMiete} €</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Erstellt am</p>
              <p className="font-medium">{new Date(mietobjekt.erstellDatum).toLocaleDateString('de-DE')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Letzte Änderung</p>
              <p className="font-medium">{new Date(mietobjekt.aktualisiert).toLocaleDateString('de-DE')}</p>
            </div>
          </div>

          {/* Bemerkungen */}
          {mietobjekt.bemerkungen && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Bemerkungen</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{mietobjekt.bemerkungen}</p>
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

  const mietobjekt = await prisma.mietobjekt.findUnique({
    where: { id }
  })

  if (!mietobjekt) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      mietobjekt: JSON.parse(JSON.stringify(mietobjekt))
    },
  }
}