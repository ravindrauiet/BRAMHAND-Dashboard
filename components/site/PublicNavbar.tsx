'use client';

import Link from 'next/link';
import { Search, LogIn, Menu, X, Play } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';

export function PublicNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme } = useTheme();
    const { data: session, status } = useSession();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg group-hover:shadow-blue-500/25 transition-all">
                            <Play className="w-4 h-4 fill-current" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">
                            Tirhuta
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search videos..."
                                className="pl-10 pr-4 py-2 w-64 bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>

                        <Link href="/browse" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors">
                            Browse
                        </Link>
                        <Link href="/music" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors">
                            Music
                        </Link>

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

                        {status === 'authenticated' && session?.user ? (
                            <div className="flex items-center gap-4">
                                {session.user.role === 'admin' && (
                                    <Link
                                        href="/dashboard"
                                        className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors"
                                    >
                                        Admin
                                    </Link>
                                )}
                                <Link
                                    href="/u/dashboard"
                                    className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                        {session.user.name?.[0] || 'U'}
                                    </div>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white max-w-[100px] truncate">
                                        {session.user.name?.split(' ')[0]}
                                    </span>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    Admin Login
                                </Link>
                                <Link
                                    href="/auth/signin"
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800">
                    <div className="px-4 pt-2 pb-6 space-y-4">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm outline-none"
                        />
                        <nav className="flex flex-col gap-4">
                            <Link href="/browse" className="text-lg font-medium text-slate-800 dark:text-slate-200">Browse</Link>
                            <Link href="/music" className="text-lg font-medium text-slate-800 dark:text-slate-200">Music</Link>
                            <hr className="border-slate-100 dark:border-slate-800" />
                            <Link href="/login" className="text-slate-500">Admin Portal</Link>
                        </nav>
                    </div>
                </div>
            )}
        </nav>
    );
}
