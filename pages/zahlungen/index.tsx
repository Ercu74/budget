import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import nextAuthOptions from '../api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/router'

const authOptions = nextAuthOptions as NextAuthOptions

export default function Zahlungen({ zahlungen, aktiveVertraege }: { zahlungen: any[], aktiveVertraege: any[] }) {
  const router = useRouter()
  const [suchbegriff, setSuchbegriff] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALLE')

  useEffect(() => {
    if (router.isReady && router.query.status) {
      setStatusFilter(router.query.status as string)
    }
  }, [router.isReady, router.query.status])

  const displayList = useMemo(() => {
    let list = zahlungen.map(z => {
      const vertrag = aktiveVertraege.find(v => v.id === z.mietverhaeltnisId);
      return {
        id: z.id,
        adresse: vertrag?.mietobjekt?.adresse || 'Unbekannt',
        mieter: vertrag?.mieter?.name || 'Unbekannt',
        soll: vertrag?.mietobjekt?.gesamtMiete || 0,
        ist: z.betrag,
        datum: new Date(z.zahlungsdatum).toLocaleDateString('de-DE'),
        status: z.status
      }
    });

    if (statusFilter !== 'ALLE') {
      list = list.filter(item => item.status === statusFilter);
    }

    if (suchbegriff) {
      list = list.filter(item => 
        item.adresse.toLowerCase().includes(suchbegriff.toLowerCase()) ||
        item.mieter.toLowerCase().includes(suchbegriff.toLowerCase())
      );
    }

    return list;
  }, [zahlungen, aktiveVertraege, suchbegriff, statusFilter]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Zahlungsübersicht</h1>
        <Link href="/zahlungen/neu">
          <button className="bg-[#1a237e] text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-900 transition-all">+ Neue Zahlung</button>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-200 flex flex-col md:flex-row gap-4">
        <input 
          type="text" 
          placeholder="Suche nach Objekt oder Mieter..." 
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          value={suchbegriff}
          onChange={(e) => setSuchbegriff(e.target.value)}
        />
        <select 
          className="border border-gray-300 rounded-lg px-4 py-2 outline-none bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALLE">Alle Status</option>
          <option value="BEZAHLT">Bezahlt</option>
          <option value="AUSSTEHEND">Ausstehend</option>
          <option value="VERSPAETET">Verspätet</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Objekt / Mieter</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Datum</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Soll</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Ist</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayList.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-900 font-medium">
                  {item.adresse} <br/><span className="text-sm text-gray-500">{item.mieter}</span>
                </td>
                <td className="px-6 py-4 text-gray-600">{item.datum}</td>
                <td className="px-6 py-4 font-bold">{item.soll} €</td>
                <td className="px-6 py-4 font-bold text-green-600">{item.ist} €</td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/zahlungen/${item.id}`}>
                    <button className="text-blue-600 hover:underline text-sm font-medium">Details</button>
                  </Link>
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

  const [zahlungen, aktiveVertraege] = await Promise.all([
    prisma.zahlung.findMany({ orderBy: { zahlungsdatum: 'desc' } }),
    prisma.mietverhaeltnis.findMany({ 
      where: { status: 'AKTIV' },
      include: { mietobjekt: true, mieter: true } 
    })
  ])

  return {
    props: {
      zahlungen: JSON.parse(JSON.stringify(zahlungen)),
      aktiveVertraege: JSON.parse(JSON.stringify(aktiveVertraege))
    }
  }
}