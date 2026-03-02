import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import { prisma } from '@/lib/prisma'
import nextAuthOptions from '../auth/[...nextauth]'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: { bodyParser: false },
}

const authOptions = nextAuthOptions as NextAuthOptions

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: 'Nicht autorisiert' })
  }

  // GET: Bir sözleşmeye ait tüm dokümanları getir
  if (req.method === 'GET') {
    try {
      const { mietverhaeltnisId } = req.query
      
      const dokumente = await prisma.dokument.findMany({
        where: { mietverhaeltnisId: String(mietverhaeltnisId) },
        orderBy: { erstellDatum: 'desc' }
      })
      
      return res.status(200).json(dokumente)
    } catch (error) {
      console.error('Dokümanlar getirilirken hata:', error)
      return res.status(500).json({ message: 'Server Fehler' })
    }
  }

  // POST: Yeni doküman yükle
  if (req.method === 'POST') {
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const form = formidable({ 
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024,
    })

    try {
      const [fields, files] = await form.parse(req)
      
      const file = files.file?.[0]
      const mietverhaeltnisId = fields.mietverhaeltnisId?.[0]
      const dokumentName = fields.dokumentName?.[0] || file?.originalFilename || 'Dokument'
      const dokumentType = fields.dokumentType?.[0] || 'SONSTIGE'

      if (!file || !mietverhaeltnisId) {
        return res.status(400).json({ message: 'Datei oder ID fehlt' })
      }

      if (file.mimetype !== 'application/pdf') {
        return res.status(400).json({ message: 'Nur PDF-Dateien erlaubt' })
      }

      const fileUrl = `/uploads/${path.basename(file.filepath)}`

      // Dokümanı veritabanına kaydet
      const dokument = await prisma.dokument.create({
        data: {
          name: dokumentName,
          url: fileUrl,
          type: dokumentType,
          mietverhaeltnis: {
            connect: { id: mietverhaeltnisId }
          }
        }
      })

      return res.status(201).json(dokument)
    } catch (error) {
      console.error('Upload Error:', error)
      return res.status(500).json({ message: 'Server Fehler' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}