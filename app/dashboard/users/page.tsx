import { fetchFromApi } from '@/lib/api';
import { UserList } from './UserList';
import { Users, Filter } from 'lucide-react';
import Link from 'next/link';
// import { Button } from "@/components/ui/button" // Assuming shadcn or similar components exist
// import { Input } from "@/components/ui/input"

import SearchInput from './SearchInput';

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

    const mappedUsers = users.map((user: any) => ({
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        mobileNumber: user.mobile_number,
        isCreator: user.is_creator,
        isVerified: user.is_verified,
        role: user.role,
        createdAt: user.created_at,
        profileImage: user.profile_image
    }));

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
            <SearchInput placeholder="Search users by name, email or phone..." />

            {/* Users Table */}
            {/* Users Table */}
            <UserList users={mappedUsers} />

            {/* Pagination */}
            <div className="glass-card p-4 rounded-xl flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                    Page {page} of {pages}
                </span>
                <div className="flex gap-2">
                    <Link
                        href={`?page=${page - 1}${query ? `&query=${query}` : ''}`}
                        className={`px-3 py-1 text-sm border rounded-lg transition-colors
                            bg-white dark:bg-slate-800 
                            border-slate-200 dark:border-slate-700 
                            text-slate-600 dark:text-slate-300 
                            hover:bg-slate-50 dark:hover:bg-slate-700
                            ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                    >
                        Previous
                    </Link>
                    <Link
                        href={`?page=${page + 1}${query ? `&query=${query}` : ''}`}
                        className={`px-3 py-1 text-sm border rounded-lg transition-colors
                            bg-white dark:bg-slate-800 
                            border-slate-200 dark:border-slate-700 
                            text-slate-600 dark:text-slate-300 
                            hover:bg-slate-50 dark:hover:bg-slate-700
                            ${page >= pages ? 'pointer-events-none opacity-50' : ''}`}
                    >
                        Next
                    </Link>
                </div>
            </div>
        </div>
    );
}
