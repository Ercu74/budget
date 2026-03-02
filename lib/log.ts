import { prisma } from './prisma'
import { NextApiRequest } from 'next'

export async function logAktivitaet(
  benutzerId: string,
  aktion: string,
  req?: NextApiRequest
) {
  try {
    const ip = req?.headers['x-forwarded-for'] || req?.socket.remoteAddress || null
    await prisma.aktivitaetsLog.create({
      data: {
        benutzerId,
        aktion,
        ipAdresse: ip?.toString(),
      },
    })
  } catch (error) {
    console.error('Log kaydedilemedi:', error)
  }
}