import { db } from '@/lib/db';
import { UserList } from './UserList';
import { User, Users, ShieldCheck, Zap } from 'lucide-react';

export default async function UsersPage() {
    const [users, totalUsers] = await Promise.all([
        db.user.findMany({
            orderBy: { createdAt: 'desc' },
        }),
        db.user.count()
    ]);

    const creatorsCount = users.filter(u => u.isCreator).length;
    const verifiedCount = users.filter(u => u.isVerified).length;
    const newUsersCount = users.filter(u => {
        const date = new Date(u.createdAt);
        const now = new Date();
        // Check if created in last 7 days
        return (now.getTime() - date.getTime()) / (1000 * 3600 * 24) <= 7;
    }).length;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">User Management</h1>
                <p className="text-slate-500 dark:text-slate-400">Oversee your platform's user base and creators.</p>
            </div>

            {/* Analytics Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalUsers}</p>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Creators</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{creatorsCount}</p>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Verified</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{verifiedCount}</p>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 bg-rose-100 dark:bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">New (7d)</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                            +{newUsersCount}
                        </p>
                    </div>
                </div>
            </div>

            <UserList users={users} />
        </div>
    );
}
