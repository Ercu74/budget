import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import { prisma } from '@/lib/prisma'
import nextAuthOptions from '../auth/[...nextauth]'

const authOptions = nextAuthOptions as NextAuthOptions

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Sadece GET isteklerine izin ver
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Session kontrolü
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: 'Nicht autorisiert' })
  }

  try {
    // Filtre parametrelerini al
    const { adresseId, nurAktiv, nurInaktiv, nurMitPdf } = req.query

    // Filtreleri hazırla
    const where: any = {}

    // Adresse filtresi
    if (adresseId) {
      where.mietobjektId = adresseId as string
    }

    // Status filtresi (AKTIV / INAKTIV)
    if (nurAktiv === 'true' && nurInaktiv !== 'true') {
      where.status = 'AKTIV'
    } else if (nurInaktiv === 'true' && nurAktiv !== 'true') {
      where.status = 'BEENDET'
    }

    // PDF filtresi
    if (nurMitPdf === 'true') {
      where.vertragUrl = { not: null }
    }

    // Mietverhaeltnisse'i filtrelerle çek
    const mietverhaeltnisse = await prisma.mietverhaeltnis.findMany({
      where: where,
      include: {
        mietobjekt: {
          select: {
            id: true,
            adresse: true
          }
        },
        mieter: {
          select: {
            id: true,
            name: true,
            email: true,
            telefon: true
          }
        }
      },
      orderBy: {
        startDatum: 'desc'
      }
    })

    // Response formatını düzenle
    const mieterListe = mietverhaeltnisse
      .filter(mv => mv.mieter !== null) // Mieter'ı olmayanları filtrele
      .map(mv => ({
        id: mv.mieter!.id,
        name: mv.mieter!.name || '',
        email: mv.mieter!.email || '',
        telefon: mv.mieter!.telefon || '',
        status: mv.status,
        vertragUrl: mv.vertragUrl,
        mietobjektAdresse: mv.mietobjekt?.adresse || '',
        mietobjektId: mv.mietobjekt?.id || '',
        mietverhaeltnisId: mv.id, // BU ÇOK ÖNEMLİ!
        // Alternatif olarak ilişkiyi de ekle
        mietverhaeltnis: {
          id: mv.id,
          status: mv.status,
          startDatum: mv.startDatum,
          endeDatum: mv.endeDatum
        }
      }))

    return res.status(200).json(mieterListe)

  } catch (error) {
    console.error('API Fehler:', error)
    return res.status(500).json({ message: 'Server Fehler' })
  }
}