import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { PublicNavbar } from '@/components/site/PublicNavbar';
import Image from 'next/image';
import { LogOut, History, Heart, PlaySquare, Music, Film } from 'lucide-react';
import Link from 'next/link';
import { UserSignOutButton } from '@/components/UserSignOutButton';
import ContentManagement from './ContentManagement';
import { getMyContent } from './actions';
import { fetchPublicApi, fetchFromApi } from '@/lib/api';

export default async function UserDashboard() {
    const session = await getServerSession(authOptions);

    if (!session || (session as any).user.role === 'admin') {
        if (!session) redirect('/login');
    }

    const userId = parseInt((session as any).user.id);
    // userId is used for logs, but actual fetch depends on token

    // Fetch User Data, Content, and Categories via API
    try {
        const [profileRes, historyRes, videos, reels, categoriesData] = await Promise.all([
            fetchFromApi('/user/profile', { headers: { 'x-user-id': userId.toString() } }),
            fetchFromApi('/user/history?limit=10', { headers: { 'x-user-id': userId.toString() } }),
            getMyContent('VIDEO'),
            getMyContent('REEL'),
            fetchPublicApi('/videos/categories')
        ]);

        // Check if user exists (checking profileRes.user explicitly)
        if (!profileRes.user) {
            console.error('Dashboard Error: User profile fetch failed', profileRes);
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Record Not Found</h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            We could not retrieve your profile from the server.
                        </p>
                        <div className="flex justify-center">
                            <UserSignOutButton />
                        </div>
                    </div>
                </div>
            );
        }

        // Map API Data (snake_case) to Component State (camelCase)
        const apiUser = profileRes.user;
        const user = {
            id: apiUser.id,
            fullName: apiUser.full_name || 'User',
            email: apiUser.email,
            profileImage: apiUser.profile_image,
            mobileNumber: apiUser.mobile_number,
            isCreator: apiUser.is_creator,
            _count: {
                videoLikes: apiUser._count?.videoLikes || 0,
                songLikes: apiUser._count?.songLikes || 0,
                playlists: apiUser._count?.playlists || 0
            },
            playlists: (apiUser.playlists || []).map((p: any) => ({
                id: p.id,
                name: p.name,
                isPublic: p.is_public
            }))
        };

        const historyData = historyRes.history || [];
        const combinedHistory = historyData.map((item: any) => ({
            id: item.id, // video id roughly maps here for key
            createdAt: item.viewed_at,
            video: {
                id: item.id,
                title: item.title,
                thumbnailUrl: item.thumbnail_url,
                creator: {
                    fullName: item.creator_name || 'Unknown'
                }
            }
        }));

        const categories = categoriesData.categories || [];

        console.log('Dashboard Page - Data loaded:', {
            userId: user.id,
            videosCount: videos.length,
            reelsCount: reels.length,
            categoriesCount: categories.length
        });

        if (videos.length > 0) {
            console.log('Dashboard Page - First video:', {
                id: videos[0].id,
                title: videos[0].title,
                type: videos[0].type
            });
        }

        return (
            <div className="min-h-screen bg-slate-50 dark:bg-black">
                <PublicNavbar />

                <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Profile Header */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 mb-8 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden ring-4 ring-white dark:ring-slate-950 shadow-xl">
                            {user.profileImage ? (
                                <Image src={user.profileImage} alt={user.fullName} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-400">
                                    {user.fullName[0]}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-2">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user.fullName}</h1>
                            <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
                            <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                                <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium">
                                    <span className="text-blue-600 font-bold">{(user._count?.videoLikes || 0) + (user._count?.songLikes || 0)}</span> Likes
                                </div>
                                <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium">
                                    <span className="text-purple-600 font-bold">{user._count?.playlists || 0}</span> Playlists
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Link
                                href="/u/upload-video"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
                            >
                                <Film className="w-5 h-5" />
                                Upload Video
                            </Link>
                            <Link
                                href="/u/upload-reel"
                                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
                            >
                                <PlaySquare className="w-5 h-5" />
                                Upload Reel
                            </Link>
                            <UserSignOutButton />
                        </div>
                    </div>

                    {/* Content Management Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">My Content</h2>
                        <ContentManagement videos={videos} reels={reels} categories={categories} />
                    </div>

                    {/* Dashboard Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Watch History */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                    <History className="w-5 h-5 text-blue-500" />
                                    Watch History
                                </h2>
                                <Link href="/u/history" className="text-sm text-blue-600 hover:underline">View All</Link>
                            </div>

                            <div className="space-y-4">
                                {combinedHistory.map((view: any) => (
                                    <Link href={`/watch/${view.video.id}`} key={view.id} className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                        <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                                            <Image
                                                src={view.video.thumbnailUrl || '/placeholder-thumb.jpg'}
                                                alt={view.video.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 py-1">
                                            <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{view.video.title}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{view.video.creator.fullName}</p>
                                            <p className="text-xs text-slate-400 mt-2">Watched {new Date(view.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </Link>
                                ))}
                                {combinedHistory.length === 0 && (
                                    <div className="text-center py-12 text-slate-500">
                                        No watch history yet. Start streaming!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Stats / Playlists */}
                        <div className="space-y-8">
                            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                                <h3 className="font-bold text-lg mb-2">Listen to ad-free music</h3>
                                <p className="text-blue-100 text-sm mb-4">Upgrade to Premium to unlock offline playback and high quality audio.</p>
                                <button className="w-full py-2 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors">
                                    Go Premium
                                </button>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <PlaySquare className="w-5 h-5 text-green-500" />
                                        My Playlists
                                    </h3>
                                    <Link href="/u/playlists" className="text-sm text-blue-600 hover:underline">Manage</Link>
                                </div>

                                {user.playlists?.length > 0 ? (
                                    <div className="space-y-3">
                                        {user.playlists.map((p: any) => (
                                            <div key={p.id} className="flex gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                                                    <Music className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm line-clamp-1">{p.name}</h4>
                                                    <p className="text-xs text-slate-500">{p.isPublic ? 'Public' : 'Private'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center text-slate-500">
                                        <p className="text-sm">Create your first playlist</p>
                                        <Link href="/u/playlists" className="text-blue-600 text-xs font-medium mt-1 inline-block">Create Now</Link>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );

    } catch (error) {
        console.error('Dashboard Load Error:', error);
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Something went wrong</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        We encountered an error loading your dashboard. Please try again later.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/" className="text-blue-600 hover:underline">Go Home</Link>
                        <UserSignOutButton />
                    </div>
                </div>
            </div>
        );
    }
}
