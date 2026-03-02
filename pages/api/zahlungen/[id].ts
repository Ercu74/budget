import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  // --- GET METODU (DETAYLAR İÇİN) ---
  if (req.method === 'GET') {
    try {
      const history = await prisma.zahlung.findMany({
        where: {
          mietverhaeltnisId: String(id), 
        },
        include: {
          mietverhaeltnis: {
            include: {
              mieter: true,
              mietobjekt: true,
            }
          }
        },
        orderBy: {
          zahlungsdatum: 'desc',
        },
      })
      return res.status(200).json(history)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Geçmiş veriler alınırken hata oluştu' })
    }
  }

  // --- PUT METODU (GÜNCELLEME İÇİN) ---
  if (req.method === 'PUT') {
    try {
      const { betrag, zahlungsdatum, status, methode, bemerkungen } = req.body
      
      const updated = await prisma.zahlung.update({
        where: { id: String(id) },
        data: { 
          betrag: parseFloat(betrag),
          zahlungsdatum: new Date(zahlungsdatum),
          status: status,
          methode: methode,
          bemerkungen: bemerkungen
        }
      })
      return res.status(200).json(updated)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Error' })
    }
  }

  // --- DELETE METODU (SİLMEK İÇİN) - YENİ EKLENDİ ---
  if (req.method === 'DELETE') {
    try {
      await prisma.zahlung.delete({
        where: { id: String(id) }
      })
      return res.status(200).json({ message: 'Erfolgreich gelöscht' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Löschen fehlgeschlagen' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}