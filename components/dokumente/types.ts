export interface Adresse {
  id: string
  adresse: string
}

export interface Kiraci {
  id: string
  name: string
  email: string
  telefon: string | null
  status: string
  vertragUrl: string | null
  mietobjektAdresse: string
  mietobjektId: string
  mietverhaeltnisId?: string
  dokumente?: any[] // Çoklu dokümanlar için
}

export interface FilterState {
  adresseId: string
  nurAktiv: boolean
  nurInaktiv: boolean
  nurMitPdf: boolean
}