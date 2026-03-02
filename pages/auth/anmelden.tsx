import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function Anmelden() {
  const [email, setEmail] = useState('')
  const [passwort, setPasswort] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Bu komut doğrudan NextAuth'a gider. 
    // Eğer [...nextauth].ts dosyan düzgünse seni içeri almalı.
    const result = await signIn('credentials', { 
      email, 
      passwort, 
      redirect: false, 
      callbackUrl: '/' 
    })

    if (result?.error) {
      setError("Giriş başarısız: " + result.error)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Girişi</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded text-black"
            placeholder="E-Mail adresiniz"
            required
          />
          <input
            type="password"
            value={passwort}
            onChange={(e) => setPasswort(e.target.value)}
            className="w-full border p-2 rounded text-black"
            placeholder="Şifre"
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold">
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  )
}