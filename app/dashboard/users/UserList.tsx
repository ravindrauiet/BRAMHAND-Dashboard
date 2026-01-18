'use client';

import { useState } from 'react';
import { Edit, Trash2, CheckCircle, XCircle, Search, Filter, Shield, User as UserIcon, Mail, Phone, MoreVertical, BadgeCheck, Zap, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { deleteUser, toggleUserCreatorStatus, toggleUserVerifiedStatus } from './actions';

interface UserListProps {
    users: any[];
}

export function UserList({ users }: UserListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all'); // all, creators, verified

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.mobileNumber && user.mobileNumber.includes(searchQuery));

        if (filter === 'creators') return matchesSearch && user.isCreator;
        if (filter === 'verified') return matchesSearch && user.isVerified;
        return matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search users by name, email, or mobile..."
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
                        <option value="all">All Users</option>
                        <option value="creators">Creators Only</option>
                        <option value="verified">Verified Only</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">User Profile</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Contact Info</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Status</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="group hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <Link href={`/dashboard/users/${user.id}`} className="block group/link">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 ring-2 ring-white dark:ring-slate-700 group-hover/link:ring-blue-500 transition-all">
                                                    {user.profileImage ? (
                                                        <Image src={user.profileImage} alt={user.fullName} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                                                            {user.fullName.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover/link:text-blue-600 transition-colors">{user.fullName}</h3>
                                                        {user.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/10" />}
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">ID: #{user.id}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {user.email && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                    {user.email}
                                                </div>
                                            )}
                                            {user.mobileNumber && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                    {user.mobileNumber}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2 items-start">
                                            {user.isCreator ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                                    <Zap className="w-3 h-3" /> Creator
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                    <UserIcon className="w-3 h-3" /> Viewer
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <form action={toggleUserCreatorStatus.bind(null, user.id, !user.isCreator)}>
                                                <button
                                                    className={`p-2 rounded-lg transition-colors ${user.isCreator ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                                                    title={user.isCreator ? "Remove Creator Status" : "Promote to Creator"}
                                                >
                                                    <Zap className="w-4 h-4" />
                                                </button>
                                            </form>
                                            <form action={toggleUserVerifiedStatus.bind(null, user.id, !user.isVerified)}>
                                                <button
                                                    className={`p-2 rounded-lg transition-colors ${user.isVerified ? 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10'}`}
                                                    title={user.isVerified ? "Remove Verification" : "Verify User"}
                                                >
                                                    <BadgeCheck className="w-4 h-4" />
                                                </button>
                                            </form>
                                            <Link
                                                href={`/dashboard/users/${user.id}`}
                                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <form action={deleteUser.bind(null, user.id)}>
                                                <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete User">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        <UserIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="text-lg font-medium">No users found</p>
                                        <p className="text-sm">Try different search terms</p>
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
