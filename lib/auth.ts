import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Static Bypass
                if (credentials?.email === 'ravindra@gmail.com' && credentials?.password === '123456') {
                    return {
                        id: '999',
                        name: 'Ravindra Admin',
                        email: 'ravindra@gmail.com',
                        image: null,
                        role: 'admin',
                        accessToken: 'DEV_TOKEN_BYPASS'
                    };
                }

                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                    const res = await fetch(`${apiUrl}/auth/login`, {
                        method: "POST",
                        body: JSON.stringify({
                            mobile_or_email: credentials?.email,
                            password: credentials?.password
                        }),
                        headers: { "Content-Type": "application/json" }
                    });

                    const data = await res.json();

                    if (res.ok && data.token) {
                        return {
                            id: data.user.id.toString(),
                            name: data.user.full_name,
                            email: data.user.email,
                            image: data.user.profile_image,
                            role: data.user.role === 'admin' || data.user.is_admin ? "admin" : (data.user.is_creator ? "creator" : "user"),
                            accessToken: data.token
                        };
                    }
                    return null;
                } catch (e) {
                    console.error("Login Error:", e);
                    return null;
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
                token.accessToken = user.accessToken;
                token.role = user.role;
                token.id = user.id;
            }
            return token
        },
        async session({ session, token }: { session: any, token: any }) {
            if (session.user) {
                session.accessToken = token.accessToken;
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session
        }
    },
    session: {
        strategy: "jwt"
    }
};
