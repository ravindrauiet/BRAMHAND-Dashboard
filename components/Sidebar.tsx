'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Video, Music, Users, Settings, LogOut, Wallet, Tags, List, Bell, Film } from 'lucide-react';
import { signOut } from 'next-auth/react';
import clsx from 'clsx';

const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Videos', href: '/dashboard/videos', icon: Video },
    { name: 'Reels', href: '/dashboard/reels', icon: Film },
    { name: 'Songs', href: '/dashboard/songs', icon: Music },
    { name: 'Users', href: '/dashboard/users', icon: Users },
    { name: 'Creators', href: '/dashboard/creators', icon: Wallet },
    { name: 'Categories', href: '/dashboard/categories', icon: List },
    { name: 'Genres', href: '/dashboard/genres', icon: Tags },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

import { ThemeToggle } from './ThemeToggle';

// ... (imports remain)

// ... (imports remain)

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-r border-gray-200 dark:border-slate-800 text-slate-800 dark:text-white h-screen flex flex-col fixed left-0 top-0 z-50 transition-colors duration-300 shadow-xl dark:shadow-none">
            <div className="p-6 flex justify-between items-center gap-2">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-600 tracking-tight">
                    Tirhuta<span className="text-slate-800 dark:text-white">Admin</span>
                </h1>
                <div className="flex-shrink-0 scale-90">
                    <ThemeToggle />
                </div>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden',
                                isActive
                                    ? 'text-white shadow-lg shadow-blue-500/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                            )}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-100" />
                            )}
                            <Icon className={clsx("h-5 w-5 relative z-10", isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors")} />
                            <span className="relative z-10 font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-6 border-t border-gray-200 dark:border-slate-800">
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
}
