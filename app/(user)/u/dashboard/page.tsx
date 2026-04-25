import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { PublicNavbar } from '@/components/site/PublicNavbar';
import { UserSignOutButton } from '@/components/UserSignOutButton';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { getMyContent } from './actions';
import { fetchPublicApi, fetchFromApi } from '@/lib/api';
import DashboardTabs from './DashboardTabs';

export default async function UserDashboard({ searchParams }: { searchParams: { tab?: string } }) {
    const session = await getServerSession(authOptions);

    // Fix #3: properly redirect both unauthenticated users and admins
    if (!session) redirect('/login');
    if ((session as any).user.role === 'admin') redirect('/dashboard');

    const userId = parseInt((session as any).user.id);
    const initialTab = searchParams.tab || 'overview';

    try {
        const [profileRes, historyRes, videos, reels, categoriesData] = await Promise.all([
            fetchFromApi('/user/profile', { headers: { 'x-user-id': userId.toString() } }),
            fetchFromApi('/user/history?limit=50', { headers: { 'x-user-id': userId.toString() } }),
            getMyContent('VIDEO'),
            getMyContent('REEL'),
            fetchPublicApi('/videos/categories'),
        ]);

        // Watchlist is non-critical — fail silently
        let watchlist: any[] = [];
        try {
            const wlRes = await fetchFromApi('/user/watchlist', { headers: { 'x-user-id': userId.toString() } });
            watchlist = wlRes.watchlist || wlRes.items || wlRes.data || [];
        } catch {
            // non-critical
        }

        // Trending videos — non-critical enrichment for Overview tab
        let trending: any[] = [];
        try {
            const trendingRes = await fetchPublicApi('/videos?sort=views&limit=6&type=VIDEO');
            trending = trendingRes.videos || trendingRes.data || [];
        } catch {
            // non-critical
        }

        if (!profileRes.user) redirect('/auth/signin');

        const apiUser = profileRes.user;
        const user = {
            id: apiUser.id,
            fullName: apiUser.full_name || 'User',
            email: apiUser.email,
            profileImage: apiUser.profile_image ?? null,
            mobileNumber: apiUser.mobile_number,
            isCreator: apiUser.is_creator ?? false,
            preferences: apiUser.preferences ?? null,
            _count: {
                totalLikes: apiUser._count?.total_likes ?? 0,
                followers: apiUser._count?.followers ?? 0,
                totalViews: apiUser._count?.total_views ?? 0,
                playlists: apiUser._count?.playlists ?? 0,
            },
            playlists: (apiUser.playlists || []).map((p: any) => ({
                id: p.id,
                name: p.name,
                isPublic: p.is_public ?? p.isPublic ?? false,
            })),
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
                creator: { fullName: item.creator_name || 'Unknown' },
            },
        }));

        const categories = categoriesData.categories || [];

        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 transition-colors duration-500 overflow-x-hidden">
                <PublicNavbar />
                <DashboardTabs
                    user={user}
                    combinedHistory={combinedHistory}
                    videos={videos}
                    reels={reels}
                    categories={categories}
                    watchlist={watchlist}
                    trending={trending}
                    greeting={greeting}
                    userRole={(session as any).user.role}
                    initialTab={initialTab}
                />
            </div>
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
                        We were unable to securely sync your account details. Please check your network or try re-authenticating.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/" className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10">
                            Go Home
                        </Link>
                        <UserSignOutButton />
                    </div>
                </div>
            </div>
        );
    }
}
