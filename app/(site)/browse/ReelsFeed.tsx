'use client';

import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Play } from 'lucide-react';
import Image from 'next/image';
import { CommentsDrawer } from './CommentsDrawer';

interface ReelsFeedProps {
    reels: any[];
}

export function ReelsFeed({ reels }: ReelsFeedProps) {
    const [muted, setMuted] = useState(true);
    const [currentReelIndex, setCurrentReelIndex] = useState(0);
    const [activeCommentReelId, setActiveCommentReelId] = useState<string | number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const options = {
            root: containerRef.current,
            threshold: 0.6,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = Number(entry.target.getAttribute('data-index'));
                    setCurrentReelIndex(index);
                }
            });
        }, options);

        const elements = containerRef.current?.querySelectorAll('.reel-item');
        elements?.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [reels]);

    const toggleMute = () => setMuted(!muted);

    return (
        <>
            <div
                ref={containerRef}
                className="fixed inset-0 top-[64px] bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide z-40"
                style={{ height: 'calc(100vh - 64px)' }}
            >
                {reels.map((reel, index) => (
                    <div
                        key={reel.id}
                        data-index={index}
                        className="reel-item h-full w-full max-w-md mx-auto relative snap-start snap-always flex items-center justify-center bg-slate-900 border-x border-white/10"
                    >
                        <ReelPlayer
                            reel={reel}
                            isActive={currentReelIndex === index}
                            muted={muted}
                            onToggleMute={toggleMute}
                            onOpenComments={() => setActiveCommentReelId(reel.id)}
                        />
                    </div>
                ))}

                {reels.length === 0 && (
                    <div className="h-full w-full flex items-center justify-center text-white">
                        <p>No reels found.</p>
                    </div>
                )}
            </div>

            {activeCommentReelId && (
                <CommentsDrawer
                    videoId={activeCommentReelId}
                    onClose={() => setActiveCommentReelId(null)}
                />
            )}
        </>
    );
}

function ReelPlayer({ reel, isActive, muted, onToggleMute, onOpenComments }: { reel: any; isActive: boolean; muted: boolean; onToggleMute: () => void; onOpenComments: () => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().catch(() => { });
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    const togglePlay = () => {
        if (videoRef.current?.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    };

    return (
        <div className="relative w-full h-full group" onClick={togglePlay}>
            <video
                ref={videoRef}
                src={reel.video_url || reel.videoUrl}
                className="w-full h-full object-cover"
                loop
                playsInline
                muted={muted}
                poster={reel.thumbnail_url || reel.thumbnailUrl}
            />

            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 pointer-events-none">
                    <Play className="w-16 h-16 text-white/80 fill-current opacity-80" />
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />

            <div className="absolute right-4 bottom-20 flex flex-col gap-6 items-center z-20">
                <button className="flex flex-col items-center gap-1 group/btn" onClick={(e) => e.stopPropagation()}>
                    <div className="p-3 bg-black/40 backdrop-blur-md rounded-full group-hover/btn:bg-black/60 transition-all">
                        <Heart className={`w-7 h-7 ${reel.isLiked ? 'text-red-500 fill-current' : 'text-white'}`} />
                    </div>
                    <span className="text-white text-xs font-medium shadow-black drop-shadow-md">
                        {reel.likes_count || reel.likesCount || 0}
                    </span>
                </button>

                <button
                    className="flex flex-col items-center gap-1 group/btn"
                    onClick={(e) => { e.stopPropagation(); onOpenComments(); }}
                >
                    <div className="p-3 bg-black/40 backdrop-blur-md rounded-full group-hover/btn:bg-black/60 transition-all">
                        <MessageCircle className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-white text-xs font-medium shadow-black drop-shadow-md">
                        {reel.comments_count || reel.commentsCount || 0}
                    </span>
                </button>

                <button className="flex flex-col items-center gap-1 group/btn" onClick={(e) => e.stopPropagation()}>
                    <div className="p-3 bg-black/40 backdrop-blur-md rounded-full group-hover/btn:bg-black/60 transition-all">
                        <Share2 className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-white text-xs font-medium shadow-black drop-shadow-md">
                        {reel.shares_count || reel.sharesCount || 0}
                    </span>
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
                    className="p-3 bg-black/40 backdrop-blur-md rounded-full group-hover/btn:bg-black/60 transition-all mt-4"
                >
                    {muted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
                </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 z-20 text-white pointer-events-none">
                <div className="flex items-center gap-3 mb-3 pointer-events-auto">
                    <div className="w-10 h-10 rounded-full border border-white/30 overflow-hidden bg-slate-700">
                        {(reel.creator?.profileImage || reel.creator_image) ? (
                            <Image
                                src={reel.creator?.profileImage || reel.creator_image}
                                alt=""
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-sm">
                                {(reel.creator?.fullName?.[0] || reel.creator_name?.[0] || 'U')}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="font-bold text-base drop-shadow-md leading-none mb-1">
                            {reel.creator?.fullName || reel.creator_name || 'Unknown Creator'}
                        </span>
                    </div>
                </div>

                <h3 className="text-sm font-medium line-clamp-2 mb-2 drop-shadow-md max-w-[85%]">
                    {reel.title}
                </h3>
            </div>
        </div>
    );
}
