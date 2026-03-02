import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import nextAuthOptions from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

const authOptions = nextAuthOptions as NextAuthOptions

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session || !session.user?.email) {
    return res.status(401).json({ message: 'Nicht authentifiziert' })
  }

  // POST: Yeni mülk (Mietobjekt) oluşturma
  if (req.method === 'POST') {
    // Frontend'den gelen zimmeranzahl -> şemada zimmer
    // Frontend'den gelen wohnflaeche -> şemada flaeche
    const { 
      adresse, 
      zimmeranzahl, 
      wohnflaeche, 
      kaltMiete, 
      nebenkosten, 
      status,
      bemerkungen 
    } = req.body

    try {
      const newObjekt = await prisma.mietobjekt.create({
        data: {
          adresse: adresse,
          // Şemana (schema.prisma) göre doğru eşleştirmeler:
          zimmer: zimmeranzahl ? parseInt(zimmeranzahl.toString()) : 0,
          flaeche: wohnflaeche ? parseFloat(wohnflaeche.toString()) : 0,
          kaltMiete: kaltMiete ? parseFloat(kaltMiete.toString()) : 0,
          nebenkosten: nebenkosten ? parseFloat(nebenkosten.toString()) : 0,
          gesamtMiete: (Number(kaltMiete) || 0) + (Number(nebenkosten) || 0),
          status: status || 'FREI',
          bemerkungen: bemerkungen || ''
        }
      })
      
      return res.status(201).json(newObjekt)
    } catch (error) {
      console.error("Mülk oluşturma hatası:", error)
      return res.status(500).json({ 
        message: 'Fehler beim Speichern des Objekts',
        error: error instanceof Error ? error.message : 'Unknown Error'
      })
    }
  }

  // GET: Tüm mülkleri listeleme
  if (req.method === 'GET') {
    try {
      const objekte = await prisma.mietobjekt.findMany({
        orderBy: { erstellDatum: 'desc' }
      })
      return res.status(200).json(objekte)
    } catch (error) {
      return res.status(500).json({ message: 'Fehler beim Laden' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}