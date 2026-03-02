import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import nextAuthOptions from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const authOptions = nextAuthOptions as NextAuthOptions

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Methode nicht erlaubt' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: 'Nicht authentifiziert' })
  }

  const { altesPasswort, neuesPasswort } = req.body

  if (!altesPasswort || !neuesPasswort || neuesPasswort.length < 6) {
    return res.status(400).json({ message: 'Ungültige Eingabe. Passwort muss mindestens 6 Zeichen lang sein.' })
  }

  try {
    const user = await prisma.benutzer.findUnique({
      where: { email: session.user.email! }
    })

    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' })
    }

    if (user.passwort) {
      const isValid = await bcrypt.compare(altesPasswort, user.passwort)
      if (!isValid) {
        return res.status(400).json({ message: 'Altes Passwort ist falsch' })
      }
    }

    const hashedPasswort = await bcrypt.hash(neuesPasswort, 10)

    await prisma.benutzer.update({
      where: { id: user.id },
      data: { passwort: hashedPasswort }
    })

    res.status(200).json({ message: 'Passwort erfolgreich geändert' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ein Fehler ist aufgetreten' })
  }
}