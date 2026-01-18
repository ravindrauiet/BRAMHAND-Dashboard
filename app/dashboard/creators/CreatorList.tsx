'use client';

import { useState } from 'react';
import {
    Search,
    Filter,
    BadgeIndianRupee,
    Building2,
    User,
    MoreVertical,
    Wallet,
    TrendingUp,
    ShieldCheck,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toggleMonetization } from './actions';

interface CreatorListProps {
    creators: any[];
}

export function CreatorList({ creators }: CreatorListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all'); // all, monetized, pending

    const filteredCreators = creators.filter(creator => {
        const matchesSearch =
            creator.popularName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            creator.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (creator.bankName && creator.bankName.toLowerCase().includes(searchQuery.toLowerCase()));

        if (filter === 'monetized') return matchesSearch && creator.isMonetizationEnabled;
        if (filter === 'pending') return matchesSearch && !creator.isMonetizationEnabled;
        return matchesSearch;
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search creators by name or bank..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select
                        className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white min-w-[150px]"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Creators</option>
                        <option value="monetized">Monetized</option>
                        <option value="pending">Not Monetized</option>
                    </select>
                </div>
            </div>

            {/* Creators Table */}
            <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Creator Profile</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Banking Details</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Lifetime Earnings</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider text-right">Monetization</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {filteredCreators.map((creator) => (
                                <tr key={creator.id} className="group hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <Link href={`/dashboard/users/${creator.userId}`} className="block group/link">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 ring-2 ring-white dark:ring-slate-700 group-hover/link:ring-purple-500 transition-all shadow-sm">
                                                    {creator.user.profileImage ? (
                                                        <Image src={creator.user.profileImage} alt={creator.popularName} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-500 font-bold">
                                                            {creator.popularName.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white group-hover/link:text-purple-600 transition-colors flex items-center gap-1.5">
                                                        {creator.popularName}
                                                        {creator.isMonetizationEnabled && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{creator.user.fullName}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="space-y-1.5">
                                            {creator.bankName ? (
                                                <>
                                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                        {creator.bankName}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                            •••• {creator.accountNumber?.slice(-4) || 'XXXX'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">{creator.panCard || 'NO PAN'}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2 text-amber-500 text-sm">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span>Details Pending</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5 ">
                                                <BadgeIndianRupee className="w-4 h-4 text-emerald-500" />
                                                <span className="text-lg font-bold text-slate-900 dark:text-white">
                                                    {formatCurrency(Number(creator.totalEarnings))}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="h-1.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full"
                                                        style={{ width: `${Math.min(Number(creator.monetizationPercentage), 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-500">{creator.monetizationPercentage}% Split</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <div className={`text-xs font-medium px-2 py-1 rounded-full ${creator.isMonetizationEnabled
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                {creator.isMonetizationEnabled ? 'Active' : 'Disabled'}
                                            </div>
                                            <button
                                                onClick={async () => await toggleMonetization(creator.id, !creator.isMonetizationEnabled)}
                                                className={`
                                                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                                                    ${creator.isMonetizationEnabled ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-700'}
                                                `}
                                                title="Toggle Monetization"
                                                type="button"
                                            >
                                                <span
                                                    className={`
                                                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                                                        ${creator.isMonetizationEnabled ? 'translate-x-6' : 'translate-x-1'}
                                                    `}
                                                />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCreators.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="text-lg font-medium">No creators found</p>
                                        <p className="text-sm">Try adjusting your filters</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
