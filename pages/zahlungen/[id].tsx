import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import { prisma } from '@/lib/prisma'
import nextAuthOptions from '../api/auth/[...nextauth]'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useState } from 'react'

const authOptions = nextAuthOptions as NextAuthOptions

interface ZahlungDetail {
  id: string
  betrag: number
  zahlungsdatum: string
  status: string
  belegUrl: string | null
  mietverhaeltnis: {
    id: string
    mietobjekt: {
      id: string
      adresse: string
      gesamtMiete: number
    } | null
    mieter: {
      id: string
      name: string | null
      email: string
      telefon: string | null
    } | null
  } | null
}

export default function ZahlungDetail({ zahlung }: { zahlung: ZahlungDetail }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Sind Sie sicher?')) return
    
    try {
      const res = await fetch(`/api/zahlungen/${zahlung.id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        router.push('/zahlungen')
      } else {
        alert('Fehler beim Löschen')
      }
    } catch (error) {
      console.error(error)
      alert('Ein Fehler ist aufgetreten')
    }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* HEADER & BUTTONS */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Zahlungsdetails
            </h1>
            <p className="text-gray-500 mt-2 font-medium">ID: {zahlung.id}</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => router.back()}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              Zurück
            </button>
            <Link href={`/zahlungen/${zahlung.id}/bearbeiten`}>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 shadow-sm transition-all">
                Bearbeiten
              </button>
            </Link>
            <button 
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 shadow-sm transition-all"
            >
              Löschen
            </button>
          </div>
        </div>

        {/* ANA KART YAPISI */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-8">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-100 pb-8">
              {/* SOL TARAF - OBJEKT & MIETER */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 text-orange-600">
                    Mietverhältnis & Objekt
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-xl font-bold text-gray-900">
                      {zahlung.mietverhaeltnis?.mietobjekt?.adresse || 'Unbekannt'}
                    </p>
                    <p className="text-gray-600 mt-1 font-medium">
                      {zahlung.mietverhaeltnis?.mieter?.name || 'Unbekannt'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Soll (Miete)</h3>
                    <p className="text-lg font-bold text-gray-900">
                      {zahlung.mietverhaeltnis?.mietobjekt?.gesamtMiete || 0} €
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Status</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                      zahlung.status === 'BEZAHLT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {zahlung.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* RECHTER BEREICH - ZAHLUNGSINFOS */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Zahlungsinformationen</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-inner">
                      <p className="text-xs text-blue-600 font-bold uppercase mb-1">Eingegangener Betrag</p>
                      <p className="text-4xl font-black text-blue-900">{zahlung.betrag} €</p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="p-2 bg-white rounded-md shadow-sm">📅</div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Zahlungsdatum</p>
                        <p className="text-lg font-bold text-gray-900">
                          {new Date(zahlung.zahlungsdatum).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* UNTERER BEREICH - KONTAKT UND BELEG */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Kontakt Mieter</h3>
                <div className="space-y-2">
                  <p className="text-gray-700 flex items-center gap-2">
                    <span className="text-gray-400">📧</span> {zahlung.mietverhaeltnis?.mieter?.email || '-'}
                  </p>
                  {zahlung.mietverhaeltnis?.mieter?.telefon && (
                    <p className="text-gray-700 flex items-center gap-2">
                      <span className="text-gray-400">📞</span> {zahlung.mietverhaeltnis.mieter.telefon}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Dokumente</h3>
                {zahlung.belegUrl ? (
                  <a 
                    href={zahlung.belegUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
                  >
                    📄 Zahlungsbeleg ansehen
                  </a>
                ) : (
                  <p className="text-gray-400 italic text-sm">Kein Beleg hinterlegt</p>
                )}
              </div>
            </div>
          </div>
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

  const zahlung = await prisma.zahlung.findUnique({
    where: { id },
    include: {
      mietverhaeltnis: {
        include: {
          mietobjekt: true,
          mieter: true
        }
      }
    }
  })

  if (!zahlung) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      zahlung: JSON.parse(JSON.stringify(zahlung))
    }
  }
}