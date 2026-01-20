import { fetchFromApi } from '@/lib/api';
import { deleteUser, toggleUserCreatorStatus, toggleUserVerifiedStatus } from './actions';
import Image from 'next/image';
import { Users, MoreVertical, Search, Filter, Shield, ShieldAlert, CheckCircle, XCircle, Wallet } from 'lucide-react';
import Link from 'next/link';
// import { Button } from "@/components/ui/button" // Assuming shadcn or similar components exist
// import { Input } from "@/components/ui/input"

export default async function UsersPage({
    searchParams
}: {
    searchParams: { page?: string, query?: string }
}) {
    const page = Number(searchParams.page) || 1;
    const query = searchParams.query || '';

    // Call Backend API
    const data = await fetchFromApi(`/admin/users?page=${page}&limit=10&search=${query}`);

    if (!data.success) {
        return <div>Error loading users</div>;
    }

    const { users, total, pages } = data;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Users Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage platform users, creators and roles</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:opacity-90 transition-opacity">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition-colors">
                        <Users className="w-4 h-4" /> Add User
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="glass-card p-4 rounded-xl flex items-center gap-4">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search users by name, email or phone..."
                    className="bg-transparent border-none outline-none flex-1 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                />
            </div>

            {/* Users Table */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <th className="px-6 py-4">User Details</th>
                                <th className="px-6 py-4">Role & Status</th>
                                <th className="px-6 py-4">Verification</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {users.map((user: any) => (
                                <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <Link href={`/dashboard/users/${user.id}`} className="block">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative flex-shrink-0">
                                                    {user.profile_image || user.profileImage ? (
                                                        <Image src={user.profile_image || user.profileImage} alt={user.full_name || user.fullName} fill className="object-cover" />
                                                    ) : (
                                                        <Users className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{user.full_name || user.fullName}</p>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">{user.email}</span>
                                                        {user.mobile_number && <span className="text-xs text-slate-400 dark:text-slate-500">{user.mobile_number}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <form action={toggleUserCreatorStatus.bind(null, user.id, !user.is_creator && !user.isCreator)}>
                                            <button type="submit" className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all ${(user.is_creator || user.isCreator)
                                                ? 'bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400 hover:bg-purple-200'
                                                : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-200'
                                                }`}>
                                                {(user.is_creator || user.isCreator) ? <Wallet className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                                                {(user.is_creator || user.isCreator) ? 'Creator' : 'Viewer'}
                                            </button>
                                        </form>
                                    </td>
                                    <td className="px-6 py-4">
                                        <form action={toggleUserVerifiedStatus.bind(null, user.id, !user.is_verified && !user.isVerified)}>
                                            <button type="submit" className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md transition-colors ${(user.is_verified || user.isVerified)
                                                ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10'
                                                : 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800'
                                                }`}>
                                                {(user.is_verified || user.isVerified) ? <CheckCircle className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                                                {(user.is_verified || user.isVerified) ? 'Verified' : 'Unverified'}
                                            </button>
                                        </form>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                        {new Date(user.created_at || user.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <form action={deleteUser.bind(null, user.id)}>
                                                <button className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete User">
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </form>
                                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Simplified) */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Page {page} of {pages}
                    </span>
                    <div className="flex gap-2">
                        <Link href={`?page=${page - 1}`} className={`px-3 py-1 text-sm border rounded ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}>
                            Previous
                        </Link>
                        <Link href={`?page=${page + 1}`} className={`px-3 py-1 text-sm border rounded ${page >= pages ? 'pointer-events-none opacity-50' : ''}`}>
                            Next
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
