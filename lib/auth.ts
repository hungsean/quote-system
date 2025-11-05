import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getByEmail } from "@/lib/queries/users"
import { verifyPassword } from "@/lib/password"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await getByEmail(credentials.email as string)
        if (!user) return null

        const isValid = await verifyPassword(
          credentials.password as string,
          user.password_hash
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
