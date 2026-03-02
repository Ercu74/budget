import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Bu bölüm artık veritabanına bakmaz, doğrudan girişe izin verir
        if (credentials?.email) {
          return { 
            id: "1", 
            name: "Admin", 
            email: credentials.email, 
            rolle: "ADMIN" 
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/auth/anmelden',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.rolle = (user as any).rolle
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).rolle = token.rolle
      }
      return session
    }
  }
})