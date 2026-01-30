'use client';

import { useState } from 'react';
import { Edit, Trash2, CheckCircle, XCircle, Search, Filter, Shield, User as UserIcon, Mail, Phone, MoreVertical, BadgeCheck, Zap, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { deleteUser, toggleUserCreatorStatus, toggleUserVerifiedStatus, updateUserRole } from './actions';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserListProps {
    users: any[];
}

export function UserList({ users }: UserListProps) {
    return (
        <div className="space-y-6">

            {/* Users Table */}

            {/* Users Table */}
            <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">User Profile</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Contact Info</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Status</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Role</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Joined Date</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {users.map((user) => (
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
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                                user.role === 'subadmin' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' :
                                                    user.role === 'employee' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                                            {user.role || 'viewer'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link
                                                href={`/dashboard/users/${user.id}`}
                                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => updateUserRole(user.id, 'admin')} className="gap-2">
                                                        <Shield className="w-4 h-4" /> Make Admin
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateUserRole(user.id, 'subadmin')} className="gap-2">
                                                        <Shield className="w-4 h-4" /> Make Sub-Admin
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateUserRole(user.id, 'employee')} className="gap-2">
                                                        <UserIcon className="w-4 h-4" /> Make Employee
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateUserRole(user.id, 'creator')} className="gap-2">
                                                        <Zap className="w-4 h-4" /> Make Creator
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateUserRole(user.id, 'viewer')} className="gap-2">
                                                        <UserIcon className="w-4 h-4" /> Make Viewer
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => toggleUserVerifiedStatus(user.id, !user.isVerified)} className="gap-2">
                                                        <BadgeCheck className="w-4 h-4" /> {user.isVerified ? 'Unverify User' : 'Verify User'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600 gap-2"
                                                        onClick={() => deleteUser(user.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Delete User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
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
