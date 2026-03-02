import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

/**
 * Kira sözleşmesi detaylarını getiren, güncelleyen ve silen API rotası.
 *
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  // GET: Verileri Çekme
  if (req.method === 'GET') {
    try {
      const obj = await prisma.mietverhaeltnis.findUnique({ 
        where: { id: String(id) },
        include: { 
          mietobjekt: true, 
          mieter: true,
          vermieter: true      // ✅ EKLENDİ
        }
      })
      
      if (!obj) {
        return res.status(404).json({ message: 'Kira sözleşmesi bulunamadı' })
      }
      
      return res.status(200).json(obj)
    } catch (e) {
      console.error('GET Error:', e)
      return res.status(500).json({ message: 'Veri çekme hatası' })
    }
  }

  // PUT: Verileri Güncelleme
  if (req.method === 'PUT') {
    try {
      const data = req.body
      
      // Tarih formatlarını güvenli bir şekilde Date objesine çevirme
      const parseDate = (dateVal: any) => {
        if (!dateVal) return undefined;
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? undefined : d;
      };

      // A. Kira Sözleşmesini Güncelle
      // Kaution değerini sayı tipine zorla çeviriyoruz
      const kautionVal = data.kaution ? parseFloat(data.kaution.toString()) : null;

      const updated = await prisma.mietverhaeltnis.update({
        where: { id: String(id) },
        data: {
          status: data.status,
          startDatum: parseDate(data.startDatum),
          endeDatum: data.endeDatum ? parseDate(data.endeDatum) : (data.endDatum ? parseDate(data.endDatum) : null),
          kaution: isNaN(kautionVal as number) ? null : kautionVal,
          vertragUrl: data.vertragUrl,
          vermieterId: data.vermieterId || undefined  // ✅ Vermieter güncelleme eklendi
        },
        include: { mietobjekt: true }
      })

      // B. İlişkili Mülk (Mietobjekt) Bilgilerini Güncelle
      // Eğer sözleşme bir mülke bağlıysa ve kira bedelleri gönderilmişse
      if (updated.mietobjektId && (data.kaltMiete !== undefined || data.nebenkosten !== undefined)) {
        const kMiete = parseFloat(data.kaltMiete?.toString() || '0')
        const nKosten = parseFloat(data.nebenkosten?.toString() || '0')

        await prisma.mietobjekt.update({
          where: { id: updated.mietobjektId },
          data: {
            kaltMiete: isNaN(kMiete) ? undefined : kMiete,
            nebenkosten: isNaN(nKosten) ? undefined : nKosten,
            gesamtMiete: (isNaN(kMiete) ? 0 : kMiete) + (isNaN(nKosten) ? 0 : nKosten)
          }
        })
      }

      // C. Kiracı (Benutzer) İsmini Güncelle
      if (data.mieterName && updated.mieterId) {
        await prisma.benutzer.update({
          where: { id: updated.mieterId },
          data: { name: data.mieterName }
        })
      }

      return res.status(200).json(updated)
    } catch (error: any) {
      console.error('Update error:', error)
      return res.status(500).json({ 
        message: 'Guncelleme hatasi', 
        error: error.message 
      })
    }
  }

  // DELETE: Silme İşlemi
  if (req.method === 'DELETE') {
    try {
      const vertrag = await prisma.mietverhaeltnis.findUnique({ 
        where: { id: String(id) } 
      })
      
      if (!vertrag) {
        return res.status(404).json({ message: 'Silinecek sözleşme bulunamadı' })
      }

      // Sözleşme silindiğinde mülkü tekrar "BOŞ" (FREI) statüsüne çekiyoruz
      if (vertrag.mietobjektId) {
        await prisma.mietobjekt.update({ 
          where: { id: vertrag.mietobjektId }, 
          data: { status: 'FREI' } 
        })
      }

      await prisma.mietverhaeltnis.delete({ 
        where: { id: String(id) } 
      })

      return res.status(200).json({ message: 'Sözleşme başarıyla silindi' })
    } catch (error: any) {
      console.error('Delete error:', error)
      return res.status(500).json({ message: 'Silme hatasi', error: error.message })
    }
  }

  // İzin verilmeyen metodlar için
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  return res.status(405).json({ message: `Method ${req.method} not allowed` })
}