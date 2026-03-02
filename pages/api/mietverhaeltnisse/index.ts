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

  try {
    // 1. Kullanıcıyı bul veya yoksa oluştur
    let user = await prisma.benutzer.findUnique({ where: { email: session.user.email } })
    
    if (!user) {
      user = await prisma.benutzer.create({
        data: {
          email: session.user.email,
          name: session.user.name || 'Admin',
          rolle: 'ADMIN',
          passwort: 'formalite_sifre_nextauth' 
        }
      })
    }

    // GET: Tüm kira sözleşmelerini listeleme
    if (req.method === 'GET') {
      const verhaeltnisse = await prisma.mietverhaeltnis.findMany({
        include: {
          mietobjekt: true,
          mieter: true,
          vermieter: true
        },
        orderBy: { erstellDatum: 'desc' }
      })
      return res.status(200).json(verhaeltnisse)
    }
    
    // POST: Yeni kira sözleşmesi oluşturma
    else if (req.method === 'POST') {
      const { mieterName, mietobjektId, adresse, kaltMiete, nebenkosten, beginnDatum, status } = req.body

      try {
        // Sayısal değerleri garantiye alıyoruz
        const nKaltMiete = Number(kaltMiete) || 0;
        const nNebenKosten = Number(nebenkosten) || 0;
        const nGesamtMiete = nKaltMiete + nNebenKosten;

        // ✅ İŞLEM BAŞLIYOR: Önce Mülkü Güncelliyoruz (Eğer ID varsa)
        if (mietobjektId) {
          await prisma.mietobjekt.update({
            where: { id: mietobjektId },
            data: { 
              kaltMiete: nKaltMiete,
              nebenkosten: nNebenKosten,
              gesamtMiete: nGesamtMiete,
              status: 'VERMIETET'
            }
          })
        }

        const result = await prisma.mietverhaeltnis.create({
          data: {
            startDatum: beginnDatum ? new Date(beginnDatum) : new Date(),
            status: status || 'AKTIV',
            
            // 2. Mülk Bağlantısı
            mietobjekt: mietobjektId 
              ? { connect: { id: mietobjektId } }
              : {
                  create: {
                    adresse: adresse,
                    kaltMiete: nKaltMiete,
                    nebenkosten: nNebenKosten,
                    gesamtMiete: nGesamtMiete,
                    status: 'VERMIETET' 
                  }
                },

            // 3. Kiracı (Mieter) Oluşturma
            mieter: {
              create: {
                name: mieterName || 'Unbekannter Mieter',
                email: `mieter-${Date.now()}@system.com`,
                rolle: 'MIETER',
                passwort: 'formalite_sifre_mieter'
              }
            },
            
            // 4. Ev Sahibi Bağlantısı
            vermieter: {
              connect: { id: user.id }
            }
          }
        })

        return res.status(201).json(result)
      } catch (error) {
        console.error("DETAYLI HATA (POST):", error)
        return res.status(500).json({ 
          message: 'Datenbankfehler', 
          error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
        })
      }
    }
  } catch (error) {
    console.error("Allgemeiner Fehler:", error)
    return res.status(500).json({ 
      message: 'Serverfehler', 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    })
  }
}