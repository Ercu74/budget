import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  // --- GET METHODU ---
  if (req.method === 'GET') {
    try {
      const mietobjekt = await prisma.mietobjekt.findUnique({
        where: { id: String(id) },
        include: {
          mietverhaeltnisse: {
            include: {
              mieter: true
            }
          }
        }
      })

      if (!mietobjekt) {
        return res.status(404).json({ message: 'Mietobjekt nicht gefunden' })
      }

      return res.status(200).json(mietobjekt)
    } catch (error) {
      console.error('GET Fehler:', error)
      return res.status(500).json({ message: 'Fehler beim Laden' })
    }
  }

  // --- PUT (GÜNCELLEME) METHODU ---
  if (req.method === 'PUT') {
    try {
      const data = req.body

      // Veri tipi dönüşümlerini ve doğrulamasını yapıyoruz
      const zimmerVal = data.zimmer ? parseInt(data.zimmer.toString(), 10) : null
      const flaecheVal = data.flaeche ? parseFloat(data.flaeche.toString()) : null
      const kaltMieteVal = data.kaltMiete ? parseFloat(data.kaltMiete.toString()) : 0
      const nebenkostenVal = data.nebenkosten ? parseFloat(data.nebenkosten.toString()) : 0
      
      // Toplam kira hesaplaması
      const gesamtMieteVal = kaltMieteVal + nebenkostenVal

      const updatedObjekt = await prisma.mietobjekt.update({
        where: { id: String(id) },
        data: {
          adresse: data.adresse,
          zimmer: isNaN(zimmerVal as number) ? undefined : zimmerVal,
          flaeche: isNaN(flaecheVal as number) ? undefined : flaecheVal,
          kaltMiete: isNaN(kaltMieteVal) ? undefined : kaltMieteVal,
          nebenkosten: isNaN(nebenkostenVal) ? undefined : nebenkostenVal,
          gesamtMiete: isNaN(gesamtMieteVal) ? undefined : gesamtMieteVal,
          status: data.status, // Schema'daki MietobjektStatus Enum ile eşleşmeli (FREI, VERMIETET vb.)
          bemerkungen: data.bemerkungen,
          // Güncelleme tarihini otomatik olarak zorlamak için:
          aktualisiert: new Date()
        }
      })

      return res.status(200).json(updatedObjekt)
    } catch (error: any) {
      console.error('PUT Fehler:', error)
      // Prisma spesifik hatalarını yakalamak için
      if (error.code === 'P2002') {
        return res.status(400).json({ message: 'Eindeutigkeitsbeschränkung verletzt' })
      }
      return res.status(500).json({ message: 'Hata: Güncellenemedi', error: error.message })
    }
  }

  // --- DELETE METHODU ---
  if (req.method === 'DELETE') {
    try {
      // 1. Önce bu mülke bağlı olan kira sözleşmelerini (Mietverhaeltnis) bul
      const verhaeltnisse = await prisma.mietverhaeltnis.findMany({
        where: { mietobjektId: String(id) }
      })

      // 2. Her bir sözleşmeye bağlı olan ödemeleri ve sözleşmenin kendisini sil (Cascade Delete taklidi)
      for (const v of verhaeltnisse) {
        await prisma.zahlung.deleteMany({
          where: { mietverhaeltnisId: v.id }
        })
        await prisma.mietverhaeltnis.delete({
          where: { id: v.id }
        })
      }

      // 3. Mülkü sil
      await prisma.mietobjekt.delete({
        where: { id: String(id) }
      })

      return res.status(200).json({ message: 'Objekt ve bağlı tüm veriler başarıyla silindi' })
    } catch (error) {
      console.error('DELETE Fehler:', error)
      return res.status(500).json({ message: 'Fehler beim Löschen' })
    }
  }

  // Desteklenmeyen metodlar için
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  return res.status(405).json({ message: `Method ${req.method} not allowed` })
}