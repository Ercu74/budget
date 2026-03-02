import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import authOptions from './auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: { bodyParser: false },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Sadece POST isteklerine izin ver
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Session kontrolü
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: 'Nicht autorisiert' })
  }

  // Upload klasörünü oluştur
  const uploadDir = path.join(process.cwd(), 'public/uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  // Formidable konfigürasyonu
  const form = formidable({ 
    uploadDir: uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
  })

  try {
    // Form verilerini parse et
    const [fields, files] = await form.parse(req)
    
    // Dosyayı al (file veya datei field'ından)
    const file = files.file?.[0] || files.datei?.[0]
    
    // Mietverhaeltnis ID'sini al (farklı field isimlerini dene)
    const mietverhaeltnisId = fields.mietverhaeltnisId?.[0] || fields.vertragId?.[0] || fields.id?.[0]

    // Validasyon
    if (!file) {
      console.log('❌ Upload hatası: Dosya bulunamadı')
      return res.status(400).json({ message: 'Keine Datei gefunden' })
    }

    if (!mietverhaeltnisId) {
      console.log('❌ Upload hatası: Mietverhaeltnis ID bulunamadı')
      return res.status(400).json({ message: 'Mietverhaeltnis ID fehlt' })
    }

    // Dosya tipi kontrolü
    if (file.mimetype !== 'application/pdf') {
      console.log('❌ Upload hatası: Yanlış dosya tipi:', file.mimetype)
      return res.status(400).json({ message: 'Nur PDF-Dateien erlaubt' })
    }

    // Dosya URL'sini oluştur
    const fileName = path.basename(file.filepath)
    const fileUrl = `/uploads/${fileName}`

    console.log('📤 Upload başarılı:', { mietverhaeltnisId, fileUrl })

    // Veritabanını güncelle
    await prisma.mietverhaeltnis.update({
      where: { id: mietverhaeltnisId },
      data: { vertragUrl: fileUrl },
    })

    console.log('✅ Veritabanı güncellendi:', mietverhaeltnisId)

    // Başarılı yanıt
    return res.status(200).json({ 
      message: 'Erfolgreich',
      url: fileUrl 
    })

  } catch (error) {
    console.error('❌ Upload Error:', error)
    return res.status(500).json({ 
      message: 'Server Fehler' 
    })
  }
}