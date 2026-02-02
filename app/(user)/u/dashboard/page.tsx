import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { PublicNavbar } from '@/components/site/PublicNavbar';
import Image from 'next/image';
import {
    LogOut, History, Heart, PlaySquare, Music, Film,
    LayoutDashboard, Plus, Settings, ChevronRight,
    TrendingUp, Star, Eye, Share2, PlusCircle, MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import { UserSignOutButton } from '@/components/UserSignOutButton';
import HistoryList from './HistoryList';
import ContentManagement from './ContentManagement';
import SettingsForm from '@/components/user/SettingsForm';
import { getMyContent } from './actions';
import { fetchPublicApi, fetchFromApi } from '@/lib/api';

export default async function UserDashboard({ searchParams }: { searchParams: { tab?: string } }) {
    const session = await getServerSession(authOptions);

    if (!session || (session as any).user.role === 'admin') {
        if (!session) redirect('/login');
    }

    const userId = parseInt((session as any).user.id);
    const activeTab = searchParams.tab || 'overview';

    // Fetch User Data, Content, and Categories via API
    try {
        const [profileRes, historyRes, videos, reels, categoriesData] = await Promise.all([
            fetchFromApi('/user/profile', { headers: { 'x-user-id': userId.toString() } }),
            fetchFromApi(`/user/history?limit=${activeTab === 'history' ? 50 : 10}`, { headers: { 'x-user-id': userId.toString() } }),
            getMyContent('VIDEO'),
            getMyContent('REEL'),
            fetchPublicApi('/videos/categories')
        ]);

        if (!profileRes.user) {
            redirect('/auth/signin');
        }

        const apiUser = profileRes.user;
        const user = {
            id: apiUser.id,
            fullName: apiUser.full_name || 'User',
            email: apiUser.email,
            profileImage: apiUser.profile_image,
            mobileNumber: apiUser.mobile_number,
            isCreator: apiUser.is_creator,
            _count: {
                totalLikes: apiUser._count?.total_likes || 0,
                followers: apiUser._count?.followers || 0,
                totalViews: apiUser._count?.total_views || 0,
                playlists: apiUser._count?.playlists || 0
            },
            playlists: (apiUser.playlists || []).map((p: any) => ({
                id: p.id,
                name: p.name,
                isPublic: p.is_public || p.isPublic
            }))
        };

        const historyData = historyRes.history || [];
        const combinedHistory = historyData.map((item: any) => ({
            id: item.view_id,
            createdAt: item.viewed_at,
            lastPosition: item.last_position || 0,
            video: {
                id: item.id,
                title: item.title,
                thumbnailUrl: item.thumbnail_url,
                duration: item.duration || 0,
                viewsCount: item.views_count || 0,
                creator: {
                    fullName: item.creator_name || 'Unknown'
                }
            }
        }));

        const categories = categoriesData.categories || [];

        // Dynamic greeting
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 transition-colors duration-500 overflow-x-hidden">
                <PublicNavbar />

                <main className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    {/* Background Glows */}
                    <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-indigo-600/5 dark:bg-indigo-600/10 blur-[120px] rounded-full" />
                    <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-purple-600/5 dark:bg-purple-600/10 blur-[120px] rounded-full" />

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 dark:from-white to-slate-500 dark:to-slate-400">
                                {greeting}, {user.fullName.split(' ')[0]}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2 font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                {user.isCreator ? 'Creator Account' : 'Member Account'}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {(user.isCreator || (session as any).user.role === 'admin') && (
                                <>
                                    <Link
                                        href="/u/upload-video"
                                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 text-xs uppercase tracking-widest"
                                    >
                                        <Film className="w-4 h-4" />
                                        Post Video
                                    </Link>
                                    <Link
                                        href="/u/upload-reel"
                                        className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-pink-600/20 active:scale-95 text-xs uppercase tracking-widest"
                                    >
                                        <PlaySquare className="w-4 h-4" />
                                        Post Reel
                                    </Link>
                                </>
                            )}
                            <div className="h-10 w-px bg-slate-200 dark:bg-white/10 mx-1" />
                            <UserSignOutButton />
                        </div>
                    </div>

                    {/* High-Level Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        {[
                            { label: 'Total Likes', value: user._count?.totalLikes || 0, icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' },
                            { label: 'Followers', value: user._count?.followers || 0, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                            { label: 'Total Views', value: user._count?.totalViews || 0, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                            { label: 'Playlists', value: user._count?.playlists || 0, icon: PlaySquare, color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/70 dark:bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/60 dark:border-white/10 hover:border-indigo-500/30 transition-all duration-300 group shadow-sm hover:shadow-md">
                                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-0.5">{stat.label}</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Menu */}
                        <div className="lg:w-64 flex-shrink-0">
                            <nav className="bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-3 border border-slate-200/50 dark:border-white/5 sticky top-28 shadow-sm">
                                <div className="space-y-1">
                                    {[
                                        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                                        { id: 'content', icon: Film, label: 'My Content', hide: !user.isCreator },
                                        { id: 'history', icon: History, label: 'Watch History' },
                                        { id: 'playlists', icon: PlaySquare, label: 'Playlists' },
                                        { id: 'settings', icon: Settings, label: 'Preferences' },
                                    ].map((item) => (
                                        !item.hide && (
                                            <Link
                                                key={item.id}
                                                href={`/u/dashboard?tab=${item.id}`}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${activeTab === item.id
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                                                    <span className="font-bold text-sm uppercase tracking-tight">{item.label}</span>
                                                </div>
                                                {activeTab === item.id && <ChevronRight className="w-4 h-4 text-white/70" />}
                                            </Link>
                                        )
                                    ))}
                                </div>

                                {/* Premium CTA */}
                                <div className="mt-6 p-4 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-2xl border border-indigo-500/20 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-white/5 blur-2xl rounded-full" />
                                    <h4 className="text-sm font-bold text-white mb-1">Upgrade to Premium</h4>
                                    <p className="text-[10px] text-slate-400 mb-3">Ad-free music & higher quality video streaming.</p>
                                    <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-indigo-600/40">
                                        Get Premium
                                    </button>
                                </div>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 min-w-0">
                            {activeTab === 'overview' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    {/* Recent History Subsection */}
                                    <section>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                                <History className="w-5 h-5 text-indigo-500" />
                                                Recent History
                                            </h2>
                                            <Link href="/u/dashboard?tab=history" className="text-sm text-indigo-500 hover:text-indigo-600 font-bold uppercase tracking-wider">Detailed History →</Link>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {combinedHistory.slice(0, 4).map((view: any) => (
                                                <Link
                                                    href={`/watch/${view.video.id}`}
                                                    key={view.id}
                                                    className="bg-white/50 dark:bg-white/5 backdrop-blur-xl flex gap-4 p-4 rounded-2xl hover:bg-white dark:hover:bg-white/10 transition-all border border-slate-200/50 dark:border-white/5 hover:border-indigo-500/20 group shadow-sm"
                                                >
                                                    <div className="relative w-32 aspect-video rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0">
                                                        <Image
                                                            src={view.video.thumbnailUrl || '/placeholder-thumb.jpg'}
                                                            alt={view.video.title}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight text-sm">{view.video.title}</h3>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{view.video.creator.fullName}</p>
                                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 font-bold uppercase tracking-widest">{new Date(view.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                            {combinedHistory.length === 0 && (
                                                <div className="col-span-full py-16 bg-white/30 dark:bg-white/5 backdrop-blur-xl rounded-[32px] text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-white/10">
                                                    <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                    <p className="font-medium">No watch history yet. Start exploring!</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    {/* Quick Upload Stats for Creator Account */}
                                    {user.isCreator && (
                                        <section className="bg-white/50 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-slate-200/50 dark:border-white/5 relative overflow-hidden border-l-4 border-indigo-500 shadow-sm">
                                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                                <div className="text-center md:text-left">
                                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Content Performance</h2>
                                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">You have uploaded {videos.length} videos and {reels.length} reels this month.</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="text-center bg-white dark:bg-white/5 px-6 py-3 rounded-2xl border border-slate-200 dark:border-white/5">
                                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Status</p>
                                                        <p className="text-xl font-black text-emerald-500 dark:text-emerald-400 flex items-center justify-center gap-1 group">
                                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                            Live
                                                        </p>
                                                    </div>
                                                    <Link href="/u/dashboard?tab=content" className="bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-slate-900/10 dark:shadow-none">
                                                        Creator Studio
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </section>
                                    )}
                                </div>
                            )}

                            {activeTab === 'content' && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    <ContentManagement videos={videos} reels={reels} categories={categories} />
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="flex items-center justify-between mb-8 px-2">
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Watch History</h2>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{combinedHistory.length} Items</div>
                                    </div>
                                    <HistoryList initialHistory={combinedHistory} />
                                </div>
                            )}


                            {
                                activeTab === 'playlists' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">My Playlists</h2>
                                            <Link href="/u/playlists" className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-black flex items-center gap-2 transition-all uppercase tracking-widest shadow-xl shadow-slate-900/10 dark:shadow-none">
                                                <Plus className="w-4 h-4" /> New Collection
                                            </Link>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {user.playlists.map((p: any) => (
                                                <div key={p.id} className="bg-white/50 dark:bg-white/5 backdrop-blur-xl group p-6 rounded-[40px] border border-slate-200/50 dark:border-white/5 hover:border-indigo-500/20 transition-all cursor-pointer shadow-sm">
                                                    <div className="w-full aspect-square bg-gradient-to-br from-indigo-600/10 to-purple-600/10 dark:from-indigo-600/20 dark:to-purple-600/20 rounded-[32px] flex items-center justify-center mb-6 ring-1 ring-slate-200 dark:ring-white/5 group-hover:scale-95 transition-transform duration-500">
                                                        <Music className="w-16 h-16 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform" />
                                                    </div>
                                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{p.name}</h4>
                                                    <p className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">{p.isPublic ? 'Public Collection' : 'Private Collection'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            }

                            {
                                activeTab === 'settings' && (
                                    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl rounded-[48px] p-8 md:p-12 border border-slate-200/50 dark:border-white/10 animate-in fade-in duration-500 shadow-2xl shadow-indigo-500/5">
                                        <div className="mb-12">
                                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Account Preferences</h2>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Customize your experience and manage your data</p>
                                        </div>

                                        <div className="space-y-12">
                                            {/* Basic Info (Read Only) */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12 border-b border-slate-200/50 dark:border-white/5">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Full Name</label>
                                                    <div className="px-6 py-5 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold text-sm uppercase">{user.fullName}</div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Email Address</label>
                                                    <div className="px-6 py-5 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold text-sm">{user.email}</div>
                                                </div>
                                            </div>

                                            {/* Advanced Settings (Editable) */}
                                            <SettingsForm user={user} />

                                            {/* Creator CTA */}
                                            <div className="p-8 bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-[40px] relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/5 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
                                                    <div className="text-center md:text-left">
                                                        <h4 className="text-lg font-black text-amber-600 dark:text-amber-500 mb-2 flex items-center justify-center md:justify-start gap-2 uppercase tracking-tight">
                                                            <Star className="w-6 h-6 fill-amber-500" /> Creator Tools
                                                        </h4>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 font-bold leading-relaxed max-w-md">Manage your creator profile, analyze performance, and monetize your content with our premium studio features.</p>
                                                    </div>
                                                    <Link href="/u/dashboard?tab=content" className="px-8 py-4 bg-amber-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-amber-500/20 whitespace-nowrap">
                                                        Open Studio Studio →
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div >
                    </div >
                </main >
            </div >
        );

    } catch (error) {
        console.error('Dashboard Load Error:', error);
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
                <div className="glassmorphism p-10 rounded-[40px] border border-white/10 text-center max-w-lg">
                    <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Star className="w-10 h-10 text-rose-500 rotate-45" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-4">Dashboard Sync Issue</h1>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        We were unable to securely sync your account details with the media servers. Please check your network or try re-authenticating.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/" className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10">Go Home</Link>
                        <UserSignOutButton />
                    </div>
                </div>
            </div>
        );
    }
}
