'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const isDark = theme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`
                relative h-8 w-14 rounded-full p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner
                ${isDark ? 'bg-slate-700 ring-1 ring-slate-600' : 'bg-slate-300 ring-1 ring-slate-400/50'}
            `}
            title="Toggle Theme"
            aria-label="Toggle Theme"
        >
            <div
                className={`
                    absolute top-1 left-1 bg-white rounded-full h-6 w-6 shadow-md transform transition-transform duration-200 flex items-center justify-center
                    ${isDark ? 'translate-x-8' : 'translate-x-0'}
                `}
            >
                {isDark ? (
                    <Moon className="h-3.5 w-3.5 text-slate-800" />
                ) : (
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                )}
            </div>
        </button>
    );
}
