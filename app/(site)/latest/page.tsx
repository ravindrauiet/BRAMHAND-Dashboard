import { fetchPublicApi } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { Clock } from 'lucide-react';

export default async function LatestPage() {
    const data = await fetchPublicApi('/videos?limit=50'); // Default sort is createdAt desc
    const videos = data.videos || [];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black">
            <div className="pt-20 pb-12 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-blue-500/10 rounded-full">
                        <Clock className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Recently Added</h1>
                        <p className="text-slate-500 dark:text-slate-400">Fresh content just for you</p>
                    </div>
                </div>

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
            </div>
        </div>
    );
}
