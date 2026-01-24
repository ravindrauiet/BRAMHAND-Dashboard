import { db } from '@/lib/db';
import { PublicNavbar } from '@/components/site/PublicNavbar';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VideoInteractions } from '@/components/site/VideoInteractions';
import Image from 'next/image';
import { ThumbsUp, MessageSquare, Share2, MoreVertical } from 'lucide-react';

export default async function WatchPage({ params }: { params: { id: string } }) {
    const videoId = parseInt(params.id);
    if (isNaN(videoId)) return notFound();

    const video = await db.video.findUnique({
        where: { id: videoId, isActive: true },
        include: {
            creator: true,
            category: true,
            _count: {
                select: { likes: true }
                // Note: using commentsCount field directly as per schema if available, else standard relations
            }
        }
    });

    if (!video) return notFound();

    // Increment global view count
    // Also record User History if logged in
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    if (userId) {
        try {
            await db.videoView.create({
                data: {
                    userId: userId,
                    videoId: videoId
                }
            });
        } catch (error) {
            console.error("Failed to record video view for user:", userId, error);
            // Continue execution - do not block the page load
        }
    }

    await db.video.update({
        where: { id: videoId },
        data: { viewsCount: { increment: 1 } }
    });

    let userHasLiked = false;
    if (userId) {
        const like = await db.videoLike.findUnique({
            where: {
                userId_videoId: {
                    userId: userId,
                    videoId: videoId
                }
            }
        });
        userHasLiked = !!like;
    }

    const relatedVideos = await db.video.findMany({
        where: {
            isActive: true,
            categoryId: video.categoryId,
            NOT: { id: videoId }
        },
        include: { creator: true },
        take: 10
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black">

            <div className="pt-20 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 xl:col-span-3">
                        {/* Video Player Container */}
                        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                            <video
                                src={video.videoUrl}
                                poster={video.thumbnailUrl || undefined}
                                controls
                                className="w-full h-full object-contain"
                                autoPlay
                            />
                        </div>

                        {/* Video Info */}
                        <div className="mt-6 space-y-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white line-clamp-2">{video.title}</h1>
                                <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pb-4 border-b border-gray-200 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
                                                {video.creator.profileImage ? (
                                                    <Image src={video.creator.profileImage} alt={video.creator.fullName} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-lg">
                                                        {video.creator.fullName[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white">{video.creator.fullName}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">1.2M Subscribers</p>
                                            </div>
                                        </div>
                                        <button className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold hover:opacity-90 transition-opacity">
                                            Subscribe
                                        </button>
                                    </div>

                                    <VideoInteractions
                                        videoId={video.id}
                                        initialLikes={video.likesCount}
                                        initialIsLiked={userHasLiked}
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                                <div className="flex gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                                    <span>{video.viewsCount} views</span>
                                    <span>•</span>
                                    <span>{new Date(video.createdAt).toLocaleDateString('en-GB')}</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap line-clamp-3">
                                    {video.description || "No description provided."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Related Videos */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="font-bold text-lg text-slate-900 dark:text-white px-1">Related Videos</h2>
                        {relatedVideos.map((relVideo) => (
                            <a href={`/watch/${relVideo.id}`} key={relVideo.id} className="flex gap-3 group">
                                <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                                    <Image
                                        src={relVideo.thumbnailUrl || '/placeholder-thumb.jpg'}
                                        alt={relVideo.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform"
                                    />
                                    <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-[10px] font-medium rounded">
                                        4:20
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                        {relVideo.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{relVideo.creator.fullName}</p>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        <span>{relVideo.viewsCount} views</span>
                                        <span>•</span>
                                        <span>{new Date(relVideo.createdAt).toLocaleDateString('en-GB')}</span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
