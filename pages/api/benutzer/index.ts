import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import nextAuthOptions from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

const authOptions = nextAuthOptions as NextAuthOptions

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ message: 'Nicht authentifiziert' })

  const user = await prisma.benutzer.findUnique({ where: { email: session.user.email! } })
  if (!user) return res.status(401).json({ message: 'Benutzer nicht gefunden' })

  if (req.method === 'GET') {
    const { rolle } = req.query
    try {
      const benutzer = await prisma.benutzer.findMany({
        where: rolle ? { rolle: rolle as any } : {},
        select: { id: true, email: true, name: true, rolle: true }
      })
      res.status(200).json(benutzer)
    } catch (error) {
      res.status(500).json({ message: 'Fehler' })
    }
  } 
  else if (req.method === 'POST') {
    if (user.rolle !== 'ADMIN' && user.rolle !== 'VERMIETER') {
      return res.status(403).json({ message: 'Keine Berechtigung' })
    }
    try {
      const { email, name, rolle } = req.body

      // ZORUNLU ALAN KONTROLÜ KALDIRILDI
      // Sadece email varsa benzersizlik kontrolü yapıyoruz
      if (email) {
        const existing = await prisma.benutzer.findUnique({ where: { email } })
        if (existing) {
          return res.status(400).json({ message: 'E-Mail bereits vorhanden' })
        }
      }

      const neuer = await prisma.benutzer.create({
        data: {
          // Eğer email yoksa geçici bir benzersiz değer atıyoruz (Çünkü Prisma'da email unique/zorunlu olabilir)
          email: email || `temp_${Date.now()}@system.local`, 
          name: name || '',
          rolle: rolle || 'MIETER', // Rolle boşsa varsayılan olarak MIETER atıyoruz
        },
      })
      res.status(201).json({ id: neuer.id, email: neuer.email, name: neuer.name, rolle: neuer.rolle })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Fehler beim Erstellen' })
    }
  }
  else {
    res.status(405).end()
  }
}