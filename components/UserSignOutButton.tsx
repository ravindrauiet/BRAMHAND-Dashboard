'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export function UserSignOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 dark:border-red-900/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
            <LogOut className="w-4 h-4" />
            Sign Out
        </button>
    );
}
