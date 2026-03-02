import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import nextAuthOptions from '../api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const authOptions = nextAuthOptions as NextAuthOptions

export default function OffeneZahlungen({ offeneZahlungen }: { offeneZahlungen: any[] }) {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Offene Zahlungen</h1>
        <Link href="/zahlungen">
          <button className="bg-gray-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-gray-700 transition-all">
            Alle Zahlungen
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Objekt / Mieter</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Fällig am</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Monatsmiete</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Bereits gezahlt</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Offen (gesamt)</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {offeneZahlungen.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-900 font-medium">
                  {item.adresse} <br/><span className="text-sm text-gray-500">{item.mieter}</span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(item.faelligAm).toLocaleDateString('de-DE')}
                </td>
                <td className="px-6 py-4 font-bold">{item.monatsmiete} €</td>
                <td className="px-6 py-4 font-bold text-green-600">{item.gezahlt} €</td>
                <td className="px-6 py-4 font-bold text-red-600">{item.offenGesamt} €</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/zahlungen/neu?mietverhaeltnisId=${item.mietverhaeltnisId}`}>
                      <button className="text-blue-600 hover:underline text-sm font-medium">
                        Zahlung erfassen
                      </button>
                    </Link>
                    <Link href={`/zahlungen/offenedetails?mietverhaeltnisId=${item.mietverhaeltnisId}`}>
                      <button className="text-green-600 hover:underline text-sm font-medium ml-2">
                        Details
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session) return { redirect: { destination: '/auth/anmelden', permanent: false } }

  // Prisma schema'ya göre: Mietverhaeltnis modeli
  // - status: MietverhaeltnisStatus (AKTIV, BEENDET, GEKUENDIGT)
  // - startDatum: DateTime
  // - mietobjekt: Mietobjekt (adresse, gesamtMiete)
  // - mieter: Benutzer (name, email)
  // - zahlungen: Zahlung[] (betrag, zahlungsdatum, status, methode)
  
  const aktiveVertraege = await prisma.mietverhaeltnis.findMany({
    where: { status: 'AKTIV' },
    include: { 
      mietobjekt: true, 
      mieter: true,
      zahlungen: {
        orderBy: { zahlungsdatum: 'asc' }
      }
    }
  })

  // Her sözleşme için aylık bazda ödenmemiş miktarları hesapla
  const offeneZahlungen = aktiveVertraege.map(vertrag => {
    const monatsmiete = vertrag.mietobjekt?.gesamtMiete || 0
    const startDatum = vertrag.startDatum ? new Date(vertrag.startDatum) : new Date()
    const heute = new Date()
    
    // Sözleşmenin başlangıcından bugüne kadar geçen ay sayısı
    const aylar: Date[] = []
    const currentDate = new Date(startDatum)
    
    while (currentDate <= heute) {
      aylar.push(new Date(currentDate))
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
    
    // Eğer hiç ay geçmemişse (yeni sözleşme), en az 1 ay göster
    if (aylar.length === 0 && startDatum <= heute) {
      aylar.push(new Date(startDatum))
    }
    
    // Ödemeleri aylara dağıt
    const aylikOdemeler: { [key: string]: number } = {}
    
    // Her ay için başlangıç değeri 0
    aylar.forEach(ay => {
      const ayYil = `${ay.getFullYear()}-${String(ay.getMonth() + 1).padStart(2, '0')}`
      aylikOdemeler[ayYil] = 0
    })
    
    // Ödemeleri ait oldukları aya ekle
    vertrag.zahlungen.forEach(zahlung => {
      const tarih = zahlung.zahlungsdatum ? new Date(zahlung.zahlungsdatum) : new Date()
      const ayYil = `${tarih.getFullYear()}-${String(tarih.getMonth() + 1).padStart(2, '0')}`
      if (aylikOdemeler[ayYil] !== undefined) {
        aylikOdemeler[ayYil] += zahlung.betrag || 0
      }
    })
    
    // Her ay için kalanı hesapla ve topla
    let kalanToplam = 0
    aylar.forEach(ay => {
      const ayYil = `${ay.getFullYear()}-${String(ay.getMonth() + 1).padStart(2, '0')}`
      const odenen = aylikOdemeler[ayYil] || 0
      const kalan = monatsmiete - odenen
      if (kalan > 0) {
        kalanToplam += kalan
      }
    })
    
    // Toplam ödenen miktar
    const gezahlt = vertrag.zahlungen.reduce((sum, z) => sum + (z.betrag || 0), 0)
    
    return {
      id: vertrag.id,
      mietverhaeltnisId: vertrag.id,
      adresse: vertrag.mietobjekt?.adresse || 'Unbekannt',
      mieter: vertrag.mieter?.name || vertrag.mieter?.email || 'Unbekannt',
      monatsmiete: monatsmiete,
      gezahlt: gezahlt,
      offenGesamt: kalanToplam,
      faelligAm: vertrag.startDatum || new Date()
    }
  }).filter(v => v.offenGesamt > 0) // Sadece ödenmemiş kısmı olanları göster

  return {
    props: {
      offeneZahlungen: JSON.parse(JSON.stringify(offeneZahlungen))
    }
  }
}