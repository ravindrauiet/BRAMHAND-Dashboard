import { db } from '@/lib/db';
import { Users, Video, Music, PlayCircle, TrendingUp, Wallet, Bell, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default async function DashboardPage() {
    const [
        userCount,
        videoCount,
        songCount,
        totalViews,
        creatorCount,
        totalEarnings,
        recentUsers,
        recentVideos
    ] = await Promise.all([
        db.user.count(),
        db.video.count(),
        db.song.count(),
        db.video.aggregate({ _sum: { viewsCount: true } }),
        db.creatorProfile.count(),
        db.creatorProfile.aggregate({ _sum: { totalEarnings: true } }),
        db.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { creatorProfile: true }
        }),
        db.video.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { creator: true }
        })
    ]);

    const stats = [
        { name: 'Total Users', value: userCount, icon: Users, color: 'blue', link: '/dashboard/users' },
        { name: 'Total Videos', value: videoCount, icon: Video, color: 'pink', link: '/dashboard/videos' },
        { name: 'Total Songs', value: songCount, icon: Music, color: 'purple', link: '/dashboard/songs' },
        { name: 'Total Views', value: totalViews._sum.viewsCount || 0, icon: PlayCircle, color: 'orange', link: '/dashboard/videos' },
    ];

    function getGradient(color: string) {
        switch (color) {
            case 'blue': return 'from-blue-500 to-cyan-400';
            case 'pink': return 'from-pink-500 to-rose-400';
            case 'purple': return 'from-purple-500 to-indigo-400';
            case 'orange': return 'from-orange-500 to-amber-400';
            default: return 'from-blue-500 to-cyan-400';
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white transition-colors duration-300">Dashboard Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, Admin</p>
                </div>
                <Link href="/dashboard/notifications" className="inline-flex items-center space-x-2 bg-slate-900 dark:bg-slate-800 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm">
                    <Bell className="w-4 h-4" />
                    <span>Send Announcement</span>
                </Link>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Link href={stat.link} key={stat.name} className="glass-card p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                            <div className={`absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity`}>
                                <Icon className="h-24 w-24 text-slate-900 dark:text-white" />
                            </div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.name}</p>
                                    <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 dark:from-white dark:to-slate-400 mt-1">
                                        {stat.value.toLocaleString()}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${getGradient(stat.color)} shadow-lg shadow-blue-500/20`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${getGradient(stat.color)} w-[70%]`}></div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Secondary Stats & Financials */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Registrations</h2>
                        </div>
                        <Link href="/dashboard/users" className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">
                                    <th className="pb-3 pl-2">User</th>
                                    <th className="pb-3">Role</th>
                                    <th className="pb-3">Joined</th>
                                    <th className="pb-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {recentUsers.map(user => (
                                    <tr key={user.id} className="group">
                                        <td className="py-4 pl-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
                                                    {user.profileImage ? (
                                                        <Image src={user.profileImage} alt={user.fullName} fill className="object-cover" />
                                                    ) : (
                                                        <Users className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user.fullName}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${user.isCreator ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                {user.isCreator ? 'Creator' : 'Viewer'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-sm text-slate-600 dark:text-slate-300">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className={`inline-block w-2 h-2 rounded-full ${user.isVerified ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Financial Widget */}
                    <Link href="/dashboard/creators" className="block glass-card p-6 rounded-2xl group hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Creator Earnings</h2>
                        </div>
                        <div className="mt-2">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Payouts Generated</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                                ₹{totalEarnings._sum.totalEarnings?.toString() || '0'}
                            </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300 border-t border-gray-100 dark:border-slate-800 pt-4">
                            <span>Active Creators</span>
                            <span className="font-semibold">{creatorCount}</span>
                        </div>
                    </Link>

                    {/* Quick Videos List */}
                    <div className="glass-card p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Video className="w-4 h-4 text-pink-500" />
                                <h3 className="font-semibold text-slate-800 dark:text-white">Recent Uploads</h3>
                            </div>
                            <Link href="/dashboard/videos" className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white">All</Link>
                        </div>
                        <div className="space-y-4">
                            {recentVideos.map(video => (
                                <div key={video.id} className="flex gap-3">
                                    <div className="w-16 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden relative flex-shrink-0">
                                        {video.thumbnailUrl && <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{video.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">by {video.creator.fullName}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
