import { useSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import { prisma } from '@/lib/prisma'
import nextAuthOptions from './api/auth/[...nextauth]'

// Dashboard Komponenten
import QuickActions from '@/components/dashboard/QuickActions'
import KpiCards from '@/components/dashboard/KpiCards'
import FinancialSummary from '@/components/dashboard/FinancialSummary'
import { DashboardProps } from '@/components/dashboard/types'

const authOptions = nextAuthOptions as NextAuthOptions

export default function Dashboard(props: DashboardProps) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-gray-600">Laden...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Willkommen zurück, {session.user?.name || session.user?.email}
        </p>
      </div>

      <QuickActions />

      <div className="mt-8">
        <KpiCards {...props} />
      </div>

      <div className="mt-8">
        <FinancialSummary {...props} />
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

  // 1. STATISTIKEN
  const anzahlObjekte = await prisma.mietobjekt.count()
  
  const aktiveVertraege = await prisma.mietverhaeltnis.findMany({
    where: { status: 'AKTIV' },
    include: { 
      mietobjekt: true, 
      mieter: true,
      zahlungen: true  // ✅ EKLENDI
    }
  })
  const anzahlAktiveVertraege = aktiveVertraege.length

  // 2. FINANZBERECHNUNG
  const sollMiete = aktiveVertraege.reduce((sum, v) => sum + (v.mietobjekt.gesamtMiete || 0), 0)

  // Tüm ödemeler
  const alleZahlungen = await prisma.zahlung.findMany({
    include: { 
      mietverhaeltnis: {
        include: {
          mietobjekt: true,
          mieter: true
        }
      }
    }
  })
  
  const erhalteneZahlungen = alleZahlungen.reduce((sum, z) => sum + (z.betrag || 0), 0)
  const offeneForderungen = sollMiete - erhalteneZahlungen

  // ÖDEME YAPMAYANLARI TESPİT ETME
  const bezahlteMietverhaeltnisIds = alleZahlungen.map(z => z.mietverhaeltnisId)
  const anzahlAusstehendeZahlungen = aktiveVertraege.filter(v => !bezahlteMietverhaeltnisIds.includes(v.id)).length

  // ✅ YENİ: Überfällige Zahlungen (30+ Tage)
  const heute = new Date()
  const ueberfaelligeZahlungen = alleZahlungen
    .filter(z => {
      if (z.status !== 'AUSSTEHEND' || !z.zahlungsdatum) return false
      const diffTime = heute.getTime() - new Date(z.zahlungsdatum).getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 30
    })
    .map(z => ({
      id: z.id,
      betrag: z.betrag || 0,
      zahlungsdatum: z.zahlungsdatum.toISOString(),
      mieter: z.mietverhaeltnis?.mieter?.name || 'Unbekannt',
      mietobjekt: z.mietverhaeltnis?.mietobjekt?.adresse || 'Unbekannt',
      tageUeberfaellig: Math.ceil((heute.getTime() - new Date(z.zahlungsdatum).getTime()) / (1000 * 60 * 60 * 24))
    }))

  // ✅ YENİ: Leerstehende Objekte
  const leerstehendeObjekte = await prisma.mietobjekt.findMany({
    where: { status: 'FREI' },
    select: {
      id: true,
      adresse: true,
      gesamtMiete: true,
      status: true
    }
  })

  // ✅ YENİ: Auslaufende Verträge (nächste 30 Tage)
  const in30Tagen = new Date()
  in30Tagen.setDate(in30Tagen.getDate() + 30)
  
  const auslaufendeVertraege = aktiveVertraege
    .filter(v => v.endeDatum && new Date(v.endeDatum) <= in30Tagen)
    .map(v => ({
      id: v.id,
      mietobjekt: v.mietobjekt.adresse,
      mieter: v.mieter.name || v.mieter.email,
      mietende: v.endeDatum!.toISOString(),
      tageBisAblauf: Math.ceil((new Date(v.endeDatum!).getTime() - heute.getTime()) / (1000 * 60 * 60 * 24))
    }))

  // 3. PROPS
  return {
    props: {
      anzahlObjekte,
      anzahlAktiveVertraege,
      anzahlAusstehendeZahlungen,
      sollMiete,
      erhalteneZahlungen,
      offeneForderungen,
      // ✅ YENİ PROPS (DashboardProps tipinde olmalı)
      ueberfaelligeZahlungen: JSON.parse(JSON.stringify(ueberfaelligeZahlungen)),
      leerstehendeObjekte: JSON.parse(JSON.stringify(leerstehendeObjekte)),
      auslaufendeVertraege: JSON.parse(JSON.stringify(auslaufendeVertraege))
    }
  }
}