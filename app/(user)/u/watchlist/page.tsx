import { fetchFromApi } from '@/lib/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PublicNavbar } from '@/components/site/PublicNavbar';
import Image from 'next/image';
import Link from 'next/link';

export default async function WatchlistPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/auth/signin');

    // Fetch from Backend API
    const response = await fetchFromApi('/user/watchlist?limit=100');
    const apiWatchlist = response.watchlist || [];

    // Map API snake_case to component structure
    const watchlist = apiWatchlist.map((item: any) => ({
        videoId: item.id,
        video: {
            id: item.id,
            title: item.title,
            thumbnailUrl: item.thumbnail_url,
            duration: item.duration,
            category: {
                name: item.category_name || 'General'
            },
            creator: {
                fullName: item.creator_name || 'Unknown',
                profileImage: item.creator_image
            }
        }
    }));

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black">
            <PublicNavbar />
            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My List</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Videos you've saved to watch later</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {watchlist.map((item: any) => (
                        <div key={item.videoId} className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300">
                            <Link href={`/watch/${item.video.id}`}>
                                <div className="relative aspect-video overflow-hidden">
                                    <Image
                                        src={item.video.thumbnailUrl || '/placeholder-thumb.jpg'}
                                        alt={item.video.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded text-white text-[10px] font-bold">
                                        {item.video.duration ? `${item.video.duration} MIN` : 'VIDEO'}
                                    </div>
                                </div>

                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                            {item.video.category.name}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {item.video.title}
                                    </h3>
                                    <div className="mt-3 flex items-center gap-3">
                                        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-slate-200">
                                            <Image
                                                src={item.video.creator.profileImage || '/default-avatar.png'}
                                                alt={item.video.creator.fullName}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                            {item.video.creator.fullName}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {watchlist.length === 0 && (
                    <div className="text-center py-32 bg-white dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your list is empty</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                            Save videos to your list to easily find them later.
                        </p>
                        <Link
                            href="/"
                            className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Explore Videos
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
