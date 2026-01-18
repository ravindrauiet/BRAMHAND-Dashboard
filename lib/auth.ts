import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                // 1. Check for Admin Env Login
                const adminEmail = process.env.ADMIN_EMAIL;
                const adminPassword = process.env.ADMIN_PASSWORD;

                if (credentials.email === adminEmail && credentials.password === adminPassword) {
                    return { id: "admin", name: "Admin", email: adminEmail, role: "admin" }
                }

                // 2. Check for Database User Login
                const user = await db.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.passwordHash) return null;

                const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

                if (!isValid) return null;

                return {
                    id: user.id.toString(),
                    name: user.fullName,
                    email: user.email,
                    image: user.profileImage,
                    role: "user"
                }
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user }: { token: any, user: any }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token
        },
        async session({ session, token }: { session: any, token: any }) {
            if (session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session
        }
    },
    session: {
        strategy: "jwt"
    }
}
