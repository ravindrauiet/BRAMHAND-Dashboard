import Link from 'next/link';
import Image from 'next/image';
import { PublicFooter } from '@/components/site/PublicFooter';
import { ChevronLeft } from 'lucide-react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-[#050505] text-white">

            {/* Minimal Auth Header */}
            <header className="absolute top-0 left-0 right-0 z-50 px-6 py-6 md:px-12 flex justify-between items-center">
                {/* Logo - Clickable to Home */}
                <Link href="/" className="relative h-10 w-10 md:h-12 md:w-12 block hover:scale-105 transition-transform duration-300">
                    <Image
                        src="/logo/Tirhutra.jpeg"
                        alt="Tirhuta"
                        fill
                        className="object-cover rounded-xl shadow-lg shadow-orange-500/20"
                    />
                </Link>

                {/* Explicit Back to Home Link (Optional but helpful) */}
                <Link
                    href="/"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors backdrop-blur-sm bg-white/5 px-4 py-2 rounded-full border border-white/10"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Home
                </Link>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow flex flex-col justify-center relative z-10 pt-20 pb-20">
                {children}
            </main>

            {/* Reuse Global Footer */}
            <PublicFooter />
        </div>
    );
}
