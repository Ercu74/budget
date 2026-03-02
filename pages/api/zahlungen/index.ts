import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import nextAuthOptions from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, nextAuthOptions as any)
  const { id } = req.query;
  
  if (req.method === 'GET') {
    try {
      const history = await prisma.zahlung.findMany({
        where: { mietverhaeltnisId: String(id) },
        include: { mietverhaeltnis: { include: { mieter: true, mietobjekt: true } } },
        orderBy: { zahlungsdatum: 'desc' }
      })
      return res.status(200).json(history)
    } catch (error) {
      return res.status(500).json({ message: 'Error' })
    }
  }
  
  if (!session || !(session as any).user?.email) {
    return res.status(401).json({ message: 'Oturum açılmamış.' })
  }

  // Kullanıcıyı bulurken hata payını azaltıyoruz
  const user = await prisma.benutzer.findFirst({ 
    where: { 
      email: {
        equals: (session as any).user?.email,
        mode: 'insensitive' // Büyük/küçük harf duyarlılığını kaldırır
      }
    } 
  })

  if (!user) {
    console.log("Sistemdeki Email:", (session as any).user?.email);
    return res.status(401).json({ 
      message: `Kullanıcı bulunamadı: ${(session as any).user?.email}. Lütfen veritabanındaki e-postayı kontrol edin.` 
    })
  }

  if (req.method === 'POST') {
    try {
      const { mietverhaeltnisId, betrag, zahlungsdatum, methode, status, bemerkungen } = req.body
      
      // 🔥 STATUS DÖNÜŞÜMÜ: "ERHALTEN" -> "BEZAHLT"
      let dbStatus = status;
      if (status === 'ERHALTEN') {
        dbStatus = 'BEZAHLT';
      }
      // Ayrıca diğer olası hatalı değerleri de kontrol et
      if (status === 'Bezahlt' || status === 'erhalten' || status === 'bezahlt') {
        dbStatus = 'BEZAHLT';
      }
      if (status === 'Ausstehend' || status === 'ausstehend') {
        dbStatus = 'AUSSTEHEND';
      }
      if (status === 'Verspätet' || status === 'verspaetet' || status === 'VERSPAETET') {
        dbStatus = 'VERSPAETET';
      }
      
      const result = await prisma.zahlung.create({
        data: {
          betrag: Number(betrag),
          zahlungsdatum: new Date(zahlungsdatum),
          methode,
          status: dbStatus,  // 🔥 Dönüştürülmüş değer
          bemerkungen: bemerkungen || "",
          mietverhaeltnis: { connect: { id: mietverhaeltnisId } },
          ersteller: { connect: { id: user.id } }
        }
      })
      return res.status(201).json(result)
    } catch (error: any) {
      console.error("Prisma Hatası:", error)
      return res.status(500).json({ message: 'Kayıt sırasında hata: ' + error.message })
    }
  }

  if (req.method === 'GET') {
    const zahlungen = await prisma.zahlung.findMany({
      include: {
        mietverhaeltnis: { include: { mietobjekt: true, mieter: true } }
      },
      orderBy: { zahlungsdatum: 'desc' }
    })
    return res.status(200).json(zahlungen)
  }

  return res.status(405).json({ message: 'Method not allowed' })
}