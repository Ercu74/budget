import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import { prisma } from '@/lib/prisma'
import nextAuthOptions from '../api/auth/[...nextauth]'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import AdresFilter from '@/components/dokumente/AdresFilter'
import Kiracilistesi from '@/components/dokumente/Kiracilistesi'
import { Adresse, Kiraci, FilterState } from '@/components/dokumente/types'

const authOptions = nextAuthOptions as NextAuthOptions

interface DokumentePageProps {
  adressen: Adresse[]
  initialMieter: Kiraci[]
}

export default function DokumentePage({ adressen, initialMieter }: DokumentePageProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterState>({
    adresseId: '',
    nurAktiv: false,
    nurInaktiv: false,
    nurMitPdf: false
  })

  const [mieterListe, setMieterListe] = useState(initialMieter)
  const [ladezustand, setLadezustand] = useState(false)

  const mietverhaeltnisMap = useMemo(() => {
    const map: Record<string, string> = {}
    mieterListe.forEach((mieter: any) => {
      if (mieter.mietverhaeltnisId) {
        map[mieter.id] = mieter.mietverhaeltnisId
      }
    })
    return map
  }, [mieterListe])

  const handleAdresseChange = (adresseId: string) => {
    setFilter(prev => ({ ...prev, adresseId }))
  }

  const handleNurAktivChange = (checked: boolean) => {
    setFilter(prev => ({ 
      ...prev, 
      nurAktiv: checked,
      nurInaktiv: checked ? false : prev.nurInaktiv
    }))
  }

  const handleNurInaktivChange = (checked: boolean) => {
    setFilter(prev => ({ 
      ...prev, 
      nurInaktiv: checked,
      nurAktiv: checked ? false : prev.nurAktiv
    }))
  }

  const handleNurMitPdfChange = (checked: boolean) => {
    setFilter(prev => ({ ...prev, nurMitPdf: checked }))
  }

  const handleResetFilter = () => {
    setFilter({
      adresseId: '',
      nurAktiv: false,
      nurInaktiv: false,
      nurMitPdf: false
    })
  }

  useEffect(() => {
    const fetchFilteredData = async () => {
      setLadezustand(true)
      try {
        const params = new URLSearchParams()
        if (filter.adresseId) params.append('adresseId', filter.adresseId)
        if (filter.nurAktiv) params.append('nurAktiv', 'true')
        if (filter.nurInaktiv) params.append('nurInaktiv', 'true')
        if (filter.nurMitPdf) params.append('nurMitPdf', 'true')

        const response = await fetch(`/api/mieter?${params}`)
        const data = await response.json()
        setMieterListe(data)
      } catch (error) {
        console.error('Veri yüklenirken hata:', error)
      } finally {
        setLadezustand(false)
      }
    }

    fetchFilteredData()
  }, [filter])

  const dokumentLoeschen = async (mieterId: string) => {
    if (!confirm('Möchten Sie diesen Mieter wirklich löschen?')) return
    alert('Mieter können nicht gelöscht werden. Nur Dokumente können gelöscht werden.')
  }

  const handleUploadSuccess = () => {}

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-800">
        Dokumentenverwaltung
      </h1>
      
      <AdresFilter 
        adresler={adressen}
        selectedAdresse={filter.adresseId}
        onAdresseChange={handleAdresseChange}
        nurAktiv={filter.nurAktiv}
        onNurAktivChange={handleNurAktivChange}
        nurInaktiv={filter.nurInaktiv}
        onNurInaktivChange={handleNurInaktivChange}
        nurMitPdf={filter.nurMitPdf}
        onNurMitPdfChange={handleNurMitPdfChange}
        onReset={handleResetFilter}
      />

      {ladezustand && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-sm md:text-base text-gray-600">Lade Daten...</p>
        </div>
      )}

      {!ladezustand && (
        <div className="-mx-4 md:mx-0 overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <Kiracilistesi 
              mieterListe={mieterListe}
              onDelete={dokumentLoeschen}
              onUploadSuccess={handleUploadSuccess}
              mietverhaeltnisMap={mietverhaeltnisMap}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session) return { redirect: { destination: '/auth/anmelden', permanent: false } }

  const adressenRes = await prisma.mietobjekt.findMany({
    select: { id: true, adresse: true }
  })

  const mietverhaeltnisse = await prisma.mietverhaeltnis.findMany({
    include: { 
      mietobjekt: true, 
      mieter: true,
      dokumente: {
        orderBy: { erstellDatum: 'desc' }
      }
    },
    orderBy: { startDatum: 'desc' }
  })

  const initialMieter = mietverhaeltnisse.map(mv => ({
    id: mv.mieter?.id || '',
    name: mv.mieter?.name || '',
    email: mv.mieter?.email || '',
    telefon: mv.mieter?.telefon || '',
    status: mv.status === 'AKTIV' ? 'AKTIV' : 'INAKTIV',
    vertragUrl: mv.vertragUrl,
    mietobjektAdresse: mv.mietobjekt?.adresse || '',
    mietobjektId: mv.mietobjekt?.id || '',
    mietverhaeltnisId: mv.id,
    dokumente: mv.dokumente
  })).filter(mieter => mieter.id !== '')

  return {
    props: {
      adressen: JSON.parse(JSON.stringify(adressenRes)),
      initialMieter: JSON.parse(JSON.stringify(initialMieter))
    },
  }
}