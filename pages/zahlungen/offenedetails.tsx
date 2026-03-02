import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import nextAuthOptions from '../api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { useRouter } from 'next/router'

const authOptions = nextAuthOptions as NextAuthOptions

export default function OffeneDetails({ 
  mietverhaeltnis, 
  zahlungen,
  zusammenfassung 
}: { 
  mietverhaeltnis: any,
  zahlungen: any[],
  zusammenfassung: any
}) {
  const router = useRouter()

  // Zahlungen nach Monat gruppieren
  const zahlungenNachMonat = zahlungen.reduce((acc: any, zahlung: any) => {
    const date = new Date(zahlung.zahlungsdatum)
    const monatKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monatName = date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
    
    if (!acc[monatKey]) {
      acc[monatKey] = {
        monatName,
        zahlungen: [],
        toplam: 0
      }
    }
    acc[monatKey].zahlungen.push(zahlung)
    acc[monatKey].toplam += zahlung.betrag
    return acc
  }, {})

  // Monatları tarihe göre sırala (yeniden eskiye)
  const sortedMonate = Object.keys(zahlungenNachMonat).sort().reverse()

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 mb-4 inline-block"
        >
          ← Zurück
        </button>
        
        <h1 className="text-3xl font-extrabold text-gray-900">Zahlungsverlauf</h1>
        <p className="text-lg text-gray-600 mt-2">
          {mietverhaeltnis.mietobjekt.adresse}
        </p>
        <p className="text-md text-gray-500">
          Mieter: {mietverhaeltnis.mieter.name || mietverhaeltnis.mieter.email}
        </p>
      </div>

      {/* Zusammenfassung */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Zusammenfassung</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Monatliche Miete</p>
            <p className="text-2xl font-bold text-blue-600">{zusammenfassung.monatlicheMiete} €</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Bereits gezahlt</p>
            <p className="text-2xl font-bold text-green-600">{zusammenfassung.gezahlt} €</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Offener Betrag</p>
            <p className="text-2xl font-bold text-red-600">{zusammenfassung.offen} €</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-2xl font-bold text-purple-600">
              {zusammenfassung.offen <= 0 ? '✅ Bezahlt' : '⚠️ Offen'}
            </p>
          </div>
        </div>
      </div>

      {/* Zahlungshistorie nach Monaten */}
      <div className="space-y-6">
        {sortedMonate.map((monatKey) => (
          <div key={monatKey} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                {zahlungenNachMonat[monatKey].monatName}
              </h3>
            </div>
            
            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-2">Datum</th>
                    <th className="pb-2">Betrag</th>
                    <th className="pb-2">Methode</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {zahlungenNachMonat[monatKey].zahlungen.map((zahlung: any) => (
                    <tr key={zahlung.id} className="border-t border-gray-100">
                      <td className="py-3">
                        {new Date(zahlung.zahlungsdatum).toLocaleDateString('de-DE')}
                      </td>
                      <td className="py-3 font-medium">{zahlung.betrag} €</td>
                      <td className="py-3 text-gray-600">{zahlung.methode}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          zahlung.status === 'BEZAHLT' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {zahlung.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="font-bold text-gray-700">Monatssumme:</span>
                <span className="font-bold text-lg text-blue-600">
                  {zahlungenNachMonat[monatKey].toplam} €
                </span>
              </div>
            </div>
          </div>
        ))}

        {zahlungen.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
            <p className="text-gray-500 text-lg">Keine Zahlungen vorhanden</p>
            <Link href={`/zahlungen/neu?mietverhaeltnisId=${mietverhaeltnis.id}`}>
              <button className="mt-4 bg-[#1a237e] text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-900">
                Erste Zahlung erfassen
              </button>
            </Link>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <Link href={`/zahlungen/neu?mietverhaeltnisId=${mietverhaeltnis.id}`}>
          <button className="bg-[#1a237e] text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-900 transition-all">
            + Neue Zahlung erfassen
          </button>
        </Link>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session) return { redirect: { destination: '/auth/anmelden', permanent: false } }

  const { mietverhaeltnisId } = context.query

  if (!mietverhaeltnisId || typeof mietverhaeltnisId !== 'string') {
    return { notFound: true }
  }

  // Mietverhaeltnis bilgilerini al
  const mietverhaeltnis = await prisma.mietverhaeltnis.findUnique({
    where: { id: mietverhaeltnisId },
    include: {
      mietobjekt: true,
      mieter: true
    }
  })

  if (!mietverhaeltnis) {
    return { notFound: true }
  }

  // Bu mietverhaeltnis'e ait tüm ödemeleri al
  const zahlungen = await prisma.zahlung.findMany({
    where: { mietverhaeltnisId: mietverhaeltnisId },
    orderBy: { zahlungsdatum: 'desc' }
  })

  // Zusammenfassung hesapla
  const monatlicheMiete = mietverhaeltnis.mietobjekt?.gesamtMiete || 0
  const gezahlt = zahlungen.reduce((sum, z) => sum + (z.betrag || 0), 0)
  const offen = monatlicheMiete - gezahlt

  return {
    props: {
      mietverhaeltnis: JSON.parse(JSON.stringify(mietverhaeltnis)),
      zahlungen: JSON.parse(JSON.stringify(zahlungen)),
      zusammenfassung: {
        monatlicheMiete,
        gezahlt,
        offen
      }
    }
  }
}