import { fetchPublicApi } from '@/lib/api';
import { PublicNavbar } from '@/components/site/PublicNavbar';
import { notFound } from 'next/navigation';
import { VideoInteractions } from '@/components/site/VideoInteractions';
import { CommentsSection } from './CommentsSection';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Share2, MoreVertical, Layers, ChevronRight } from 'lucide-react';

export default async function WatchPage({ params }: { params: { id: string } }) {
    const videoId = params.id;

    // 1. Fetch Video Data
    const videoRes = await fetchPublicApi(`/videos/${videoId}`);

    if (!videoRes || !videoRes.video) {
        return notFound();
    }

    const { video } = videoRes;
    const isSeriesEpisode = !!video.series_id;

    // 2. Conditional Fetching based on Type
    let sidebarData = [];
    let sidebarType = 'related'; // 'related' or 'episodes'

    if (isSeriesEpisode) {
        const seriesRes = await fetchPublicApi(`/series/${video.series_id}`);
        if (seriesRes?.series?.episodes) {
            sidebarData = seriesRes.series.episodes;
            sidebarType = 'episodes';
        }
    } else {
        const relatedRes = await fetchPublicApi(`/videos?category_id=${video.category_id}&limit=10&exclude_series=true`);
        // Filter out current video
        sidebarData = relatedRes?.videos?.filter((v: any) => v.id !== video.id) || [];
    }

    // record view (fire and forget in server component is tricky, ideally client side effect, 
    // but here we can just let the implicit "get" view count logic handle it if backend does it, 
    // or rely on client side useEffect. For now, assuming standard fetch is okay)

    const formatDuration = (seconds?: number | null) => {
        if (!seconds) return '';
        if (seconds < 60) return `0:${seconds.toString().padStart(2, '0')}`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
            <PublicNavbar />

            {/* Cinematic Player Container */}
            <div className="w-full bg-black">
                <div className="max-w-[1800px] mx-auto pt-16">
                    <div className="relative aspect-video w-full max-h-[85vh] bg-black shadow-2xl">
                        <video
                            src={video.video_url || video.videoUrl}
                            poster={video.thumbnail_url || video.thumbnailUrl}
                            controls
                            className="w-full h-full object-contain"
                            autoPlay
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-12">

                    {/* Main Content Info */}
                    <div className="lg:col-span-2 xl:col-span-3 space-y-8">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4">{video.title}</h1>

                            <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-white/10">
                                {/* Creator Info */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 relative">
                                        <Image
                                            src={video.creator_image || video.creator?.profileImage || '/placeholder-user.jpg'}
                                            alt={video.creator_name || 'Creator'}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-none mb-1">{video.creator_name || video.creator?.fullName}</h3>
                                        <p className="text-sm text-gray-400">Creator</p>
                                    </div>
                                    <button className="ml-4 px-5 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-colors">
                                        Subscribe
                                    </button>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <VideoInteractions
                                        videoId={video.id}
                                        initialLikes={video.likes_count || video.likesCount || 0}
                                        initialIsLiked={video.is_liked || false}
                                    />
                                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-full font-medium transition-colors text-sm text-white">
                                        <Share2 className="w-5 h-5" /> Share
                                    </button>
                                    <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Description Box */}
                        <div className="p-4 bg-[#1f1f1f] rounded-xl hover:bg-[#2a2a2a] transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4 text-sm font-bold text-white mb-2">
                                <span>{(video.views_count || video.viewsCount || 0).toLocaleString()} views</span>
                                <span>{new Date(video.created_at || video.createdAt).toLocaleDateString()}</span>
                                <span className="text-gray-400 font-normal">#{video.category_name || video.category?.name}</span>
                            </div>
                            <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                                {video.description || "No description provided."}
                            </p>
                        </div>

                        {/* Comments Section */}
                        <div className="pt-4">
                            <CommentsSection videoId={parseInt(videoId)} />
                        </div>
                    </div>

                    {/* SIDEBAR: Conditional Rendering */}
                    <div className="lg:col-span-1">
                        {sidebarType === 'episodes' ? (
                            // SERIES LAYOUT: Episode List
                            <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
                                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-purple-500" />
                                        Episodes
                                    </h2>
                                    <span className="text-xs text-gray-400 uppercase tracking-wider">Season 1</span>
                                </div>
                                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                                    {sidebarData.map((ep: any, idx: number) => {
                                        const isActive = ep.id === video.id;
                                        return (
                                            <Link
                                                href={`/watch/${ep.id}`}
                                                key={ep.id}
                                                className={`flex gap-3 p-3 hover:bg-white/5 transition-colors ${isActive ? 'bg-white/10 border-l-4 border-purple-500' : ''}`}
                                            >
                                                <div className="relative w-32 aspect-video bg-black/50 rounded overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={ep.thumbnailUrl || ep.thumbnail_url || '/placeholder-thumb.jpg'}
                                                        alt={ep.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    {isActive && (
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                                                            <span className="ml-2 text-[10px] font-bold uppercase">Now Playing</span>
                                                        </div>
                                                    )}
                                                    {!isActive && (
                                                        <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[9px] font-bold">
                                                            {formatDuration(ep.duration)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <h4 className={`text-sm font-medium leading-snug line-clamp-2 ${isActive ? 'text-purple-400' : 'text-gray-200'}`}>
                                                        {idx + 1}. {ep.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ep.description}</p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                                {sidebarData.length > 0 && (
                                    <Link href={`/series/${video.series_id}`} className="block p-3 text-center text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors border-t border-white/10">
                                        View Full Series Details <ChevronRight className="w-3 h-3 inline ml-1" />
                                    </Link>
                                )}
                            </div>
                        ) : (
                            // MOVIE LAYOUT: Up Next Logic
                            <>
                                <h2 className="text-xl font-bold mb-6">Up Next</h2>
                                <div className="space-y-4">
                                    {sidebarData.map((relVideo: any) => (
                                        <Link href={`/watch/${relVideo.id}`} key={relVideo.id} className="flex gap-3 group">
                                            <div className="relative w-44 aspect-video rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                                                <Image
                                                    src={relVideo.thumbnail_url || relVideo.thumbnailUrl || '/placeholder-thumb.jpg'}
                                                    alt={relVideo.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                {formatDuration(relVideo.duration) && (
                                                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 text-white text-[10px] font-bold rounded">
                                                        {formatDuration(relVideo.duration)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 py-0.5">
                                                <h4 className="font-semibold text-sm text-white line-clamp-2 leading-snug mb-1 group-hover:text-blue-400 transition-colors">
                                                    {relVideo.title}
                                                </h4>
                                                <p className="text-xs text-gray-400 hover:text-white transition-colors">
                                                    {relVideo.creator_name || relVideo.creator?.fullName}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                                    <span>{relVideo.views_count || relVideo.viewsCount || 0} views</span>
                                                    <span>•</span>
                                                    <span>{new Date(relVideo.created_at || relVideo.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
