'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SearchInput({ placeholder }: { placeholder: string }) {
    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('query')?.toString() || '');

    useEffect(() => {
        const handler = setTimeout(() => {
            const currentQuery = searchParams.get('query')?.toString() || '';

            // Only update if the search term has actually changed
            if (searchTerm !== currentQuery) {
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', '1');
                if (searchTerm) {
                    params.set('query', searchTerm);
                } else {
                    params.delete('query');
                }
                replace(`?${params.toString()}`);
            }
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, searchParams, replace]);

    return (
        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
            <Search className="w-5 h-5 text-slate-400" />
            <input
                type="text"
                placeholder={placeholder}
                className="bg-transparent border-none outline-none flex-1 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
            />
        </div>
    );
}
