import type { Metadata } from 'next'
import { Poppins, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    variable: '--font-poppins',
})

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair',
})

export const metadata: Metadata = {
    title: 'Tirhuta | Movies, Series & Reels',
    description: 'The ultimate destination for premium storytelling.',
    icons: {
        icon: '/logo/Tirhutra.jpeg',
        apple: '/logo/Tirhutra.jpeg', // Optional: for Apple devices
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning className={`${poppins.variable} ${playfair.variable}`}>
            <head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
            </head>
            <body className={`${poppins.className} bg-[#0a0a14] text-white selection:bg-[#fbbf24]/30 selection:text-white`}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
