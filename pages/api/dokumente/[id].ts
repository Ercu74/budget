import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import authOptions from '../auth/[...nextauth]'  // ✅ DÜZELTİLDİ: ../../ yerine ../

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { id } = req.query
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ID' })
    }

    // Önce bu benutzer'a ait mietverhaeltnis var mı kontrol et
    const mietverhaeltnis = await prisma.mietverhaeltnis.findFirst({
      where: { mieterId: id }
    })

    if (mietverhaeltnis) {
      // Önce mietverhaeltnis'i sil
      await prisma.mietverhaeltnis.delete({
        where: { id: mietverhaeltnis.id }
      })
    }

    // ✅ DÜZELTİLDİ: mieter -> benutzer
    await prisma.benutzer.delete({
      where: { id: id }
    })

    return res.status(200).json({ success: true })

  } catch (error) {
    console.error('Delete error:', error)
    return res.status(500).json({ error: 'Could not delete' })
  }
}