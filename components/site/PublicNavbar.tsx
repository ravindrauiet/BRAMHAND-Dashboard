'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, LogIn, Menu, X, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function PublicNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { data: session, status } = useSession();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/browse?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] w-full px-6 lg:px-20 py-6 transition-all duration-300 ${scrolled ? 'py-4 bg-[#0a0a14]/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
            <div className="mx-auto flex max-w-[1440px] items-center justify-between">
                <div className="flex items-center gap-14">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                        <div className="relative h-10 w-10 flex-shrink-0 rounded-xl overflow-hidden shadow-lg shadow-[#fbbf24]/20 border border-white/10">
                            <Image
                                src="/logo/Tirhutra.jpeg"
                                alt="Tirhuta Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h2 className="text-2xl font-black tracking-[0.2em] text-white">TIRHUTA</h2>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-10">
                        <Link href="/" className="text-sm font-bold text-[#fbbf24]">Home</Link>
                        <Link href="/browse?cat=movies" className="text-sm font-semibold text-white/70 transition-colors hover:text-white">Movies</Link>
                        <Link href="/browse?cat=series" className="text-sm font-semibold text-white/70 transition-colors hover:text-white">Series</Link>
                        <Link href="/browse?cat=reels" className="text-sm font-semibold text-white/70 transition-colors hover:text-white">Reels</Link>
                        <Link href="/browse?cat=originals" className="text-sm font-semibold text-white/70 transition-colors hover:text-white">Originals</Link>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative hidden xl:block">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-xl">search</span>
                        <input
                            className="h-11 w-72 rounded-full border-none bg-white/5 pl-12 text-sm text-white placeholder:text-white/30 focus:ring-1 focus:ring-[#fbbf24]/50 glassmorphism outline-none"
                            placeholder="Search experiences..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    <div className="flex items-center gap-6">
                        <Link href="/premium" className="hidden sm:flex items-center gap-2 rounded-full bg-[#fbbf24] px-4 py-1.5 shadow-lg shadow-[#fbbf24]/20 group cursor-pointer hover:scale-105 transition-all">
                            <span className="material-symbols-outlined text-black text-sm font-bold">workspace_premium</span>
                            <span className="text-[11px] font-black uppercase tracking-wider text-black">Premium</span>
                        </Link>

                        <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined text-white/70">notifications</span>
                        </button>

                        {/* Profile / Auth */}
                        {status === 'authenticated' && session?.user ? (
                            <Link href="/u/dashboard">
                                <div className="h-10 w-10 rounded-full border-2 border-[#fbbf24]/30 bg-cover bg-center ring-4 ring-black/50 overflow-hidden relative">
                                    {session.user.image ? (
                                        <img src={session.user.image} alt="Profile" className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center font-bold text-[#fbbf24]">
                                            {session.user.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ) : (
                            <Link href="/auth/signin" className="flex items-center gap-2 text-sm font-bold text-white hover:text-[#fbbf24] transition-colors">
                                <LogIn className="w-4 h-4" />
                                Sign In
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a0a14] border-t border-white/10 p-6 space-y-4 shadow-2xl">
                    <nav className="flex flex-col gap-4">
                        <Link href="/" className="text-lg font-bold text-[#fbbf24]">Home</Link>
                        <Link href="/browse?cat=movies" className="text-lg font-semibold text-white/70">Movies</Link>
                        <Link href="/browse?cat=series" className="text-lg font-semibold text-white/70">Series</Link>
                        <Link href="/browse?cat=reels" className="text-lg font-semibold text-white/70">Reels</Link>
                        <hr className="border-white/10" />
                        <Link href="/auth/signin" className="text-white/50">Login / Sign Up</Link>
                    </nav>
                </div>
            )}
        </nav>
    );
}
