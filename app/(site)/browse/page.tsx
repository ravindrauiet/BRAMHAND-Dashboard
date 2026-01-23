import { fetchPublicApi } from '@/lib/api';
import { PublicNavbar } from '@/components/site/PublicNavbar';
import Image from 'next/image';
import Link from 'next/link';

export default async function BrowsePage({ searchParams }: { searchParams: { cat?: string; q?: string } }) {
    const category = searchParams.cat || '';
    const query = searchParams.q || '';

    let endpoint = '/videos?limit=50';

    if (query) {
        endpoint += `&search=${encodeURIComponent(query)}`;
    } else if (category) {
        if (category === 'movies') endpoint += '&type=movie';
        else if (category === 'series') endpoint += '&type=series';
        else if (category === 'reels') endpoint += '&type=reel';
        else if (category === 'originals') endpoint += '&is_featured=1';
        else if (!isNaN(Number(category))) endpoint += `&category_id=${category}`;
    }

    // Parallel Fetch
    const [videosData, categoriesData] = await Promise.all([
        fetchPublicApi(endpoint),
        fetchPublicApi('/videos/categories')
    ]);

    const videos = videosData.videos || [];
    const categories = categoriesData.categories || [];

    const getTitle = () => {
        if (query) return `Search results for "${query}"`;
        if (category === 'movies') return 'Movies';
        if (category === 'series') return 'TV Series';
        if (category === 'reels') return 'Reels';
        if (category === 'originals') return 'Originals';
        if (!isNaN(Number(category))) {
            return categories.find((c: any) => c.id === parseInt(category))?.name || 'Category';
        }
        return 'All Videos';
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black">

            <div className="pt-20 pb-12 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Category Pills */}
                <div className="flex items-center gap-4 overflow-x-auto pb-8 scrollbar-hide">
                    <Link
                        href="/browse"
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${!category && !query
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                            : 'bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800'
                            }`}
                    >
                        All
                    </Link>
                    {categories.map((cat: any) => (
                        <Link
                            key={cat.id}
                            href={`/browse?cat=${cat.id}`}
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${parseInt(category) === cat.id
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                                : 'bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800'
                                }`}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>

                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
                    {getTitle()}
                </h1>

                {/* Video Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10">
                    {videos.map((video: any) => (
                        <div key={video.id} className="group">
                            <Link href={`/watch/${video.id}`} className="block relative aspect-video rounded-xl overflow-hidden bg-slate-800">
                                <Image
                                    src={video.thumbnailUrl || video.thumbnail_url || '/placeholder-thumb.jpg'}
                                    alt={video.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-medium rounded-md">
                                    4:20
                                </div>
                            </Link>

                            <div className="mt-3 flex gap-3">
                                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0 relative">
                                    {(video.creator?.profileImage || video.creator_image) && (
                                        <Image
                                            src={video.creator?.profileImage || video.creator_image}
                                            alt=""
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 text-sm leading-tight group-hover:text-blue-600 transition-colors">
                                        <Link href={`/watch/${video.id}`}>{video.title}</Link>
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 hover:text-slate-700 dark:hover:text-slate-200">
                                        {video.creator?.fullName || video.creator_name}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        <span>{video.viewsCount || 0} views</span>
                                        <span>•</span>
                                        <span>{video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'Recently'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {videos.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-xl text-slate-500">No videos found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
