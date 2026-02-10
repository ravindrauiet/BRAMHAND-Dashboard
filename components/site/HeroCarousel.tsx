'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, ChevronLeft, ChevronRight, Volume2, VolumeX, Plus, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleWatchlist } from '@/app/actions/video';

// Helper to get thumbnail (reused logic)
const getThumbnail = (video: any) => {
    if (!video) return '/placeholder-wide.jpg';
    return video.thumbnailUrl || video.thumbnail_url || video.coverImage || video.cover_image || video.coverImageUrl || video.cover_image_url || video.preview || video.preview_image || '/placeholder-wide.jpg';
};

const formatDuration = (seconds: number) => {
    if (!seconds) return null; // Return null instead of '0m'
    const min = Math.floor(seconds / 60);
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

interface HeroCarouselProps {
    videos: any[];
}

export function HeroCarousel({ videos }: HeroCarouselProps) {
    // Ensure we have videos
    const heroVideos = videos.slice(0, 5); // Top 5
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const [showVideo, setShowVideo] = useState(false);
    const [videoLoading, setVideoLoading] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const activeVideo = heroVideos[currentIndex];

    // Auto-advance slide if not interacting (and video is not playing/user hovered?)
    // For a premium feel, Amazon/Netflix usually STOP auto-advance if video starts playing.
    useEffect(() => {
        if (showVideo) return; // Don't advance if video is playing

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % heroVideos.length);
        }, 8000); // 8 seconds per slide

        return () => clearInterval(timer);
    }, [showVideo, heroVideos.length]);

    // Reset state on slide change
    useEffect(() => {
        setShowVideo(false);
        setVideoLoading(false);

        // Auto-play trailer after delay
        const videoTimer = setTimeout(() => {
            if (activeVideo?.trailer_url) {
                setVideoLoading(true);
                setShowVideo(true);
            }
        }, 3000); // 3s delay before video background fades in

        return () => clearTimeout(videoTimer);
    }, [currentIndex, activeVideo]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % heroVideos.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + heroVideos.length) % heroVideos.length);
    };

    const handleWishlistToggle = async () => {
        if (!activeVideo || wishlistLoading) return;
        setWishlistLoading(true);
        try {
            // Optimistic update (requires parent state update in real app, but local toggle for UI feel)
            // In a real strict implementation, we'd emit this up. For now, we call the action.
            await toggleWatchlist(activeVideo.id);
            // Force re-render or toast? We'll assume strict backend update for now.
        } catch (err) {
            console.error(err);
        } finally {
            setWishlistLoading(false);
        }
    };

    if (!heroVideos.length) return null;

    // Helper to check if description is redundant (same as title)
    const showDescription = activeVideo.description && activeVideo.description !== activeVideo.title;

    return (
        <div className="relative h-[85vh] md:h-[95vh] w-full overflow-hidden shrink-0 group">

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeVideo.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full"
                >
                    {/* Background Layer (Image/Video) */}
                    <div className="absolute inset-0 bg-[#0a0a14]">
                        {showVideo && activeVideo.trailer_url ? (
                            <video
                                src={activeVideo.trailer_url}
                                autoPlay
                                muted={isMuted}
                                loop
                                playsInline
                                onLoadedData={() => setVideoLoading(false)}
                                className={cn("h-full w-full object-cover transition-opacity duration-1000", videoLoading ? "opacity-0" : "opacity-60")}
                            />
                        ) : null}

                        {/* Fallback Image (Always visible behind or when video off) */}
                        <Image
                            src={getThumbnail(activeVideo)}
                            alt={activeVideo.title}
                            fill
                            className={cn("object-cover transition-opacity duration-1000", showVideo && !videoLoading ? "opacity-0" : "opacity-100")}
                            priority
                            quality={90}
                        />

                        {/* Cinematic Gradients - Lightened for better visibility */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a14] via-[#0a0a14]/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/20 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a14]/60 via-transparent to-transparent h-32 md:h-40" />
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Content Layer - Positioned Absolute */}
            <div className="absolute inset-0 flex flex-col justify-end pb-20 md:justify-center md:pb-0 px-6 lg:px-20 z-20 pointer-events-none">
                <div className="max-w-[1600px] w-full mx-auto pointer-events-auto">
                    <motion.div
                        key={`content-${activeVideo.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="max-w-3xl space-y-6 md:space-y-8"
                    >
                        {/* Tags / Badges */}
                        <div className="flex flex-wrap items-center gap-3">
                            {activeVideo.is_trending && (
                                <span className="bg-[#E50914] text-white px-3 py-1 rounded text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg transform rotate-1">
                                    #1 Trending
                                </span>
                            )}
                            <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider border border-white/10">
                                {activeVideo.category_name || 'Movie'}
                            </span>
                        </div>

                        {/* Title - Image or Text */}
                        <h1 className="text-4xl md:text-6xl lg:text-8xl font-black font-serif-display text-white leading-[1.1] md:leading-[0.9] drop-shadow-2xl text-shadow-lg mt-2 md:mt-0 tracking-tight">
                            {activeVideo.title}
                        </h1>

                        {/* Metadata line */}
                        <div className="flex items-center gap-4 text-white/90 font-medium text-xs md:text-sm tracking-wide">
                            <span className="text-white/90">{new Date(activeVideo.created_at).getFullYear()}</span>
                            <span className="text-white/40">•</span>
                            <span className="border border-white/40 px-2 py-0.5 rounded text-[10px] md:text-xs bg-black/20">{activeVideo.content_rating || 'U/A 13+'}</span>
                            {/* Hide duration if 0 */}
                            {formatDuration(activeVideo.duration) && (
                                <>
                                    <span className="text-white/40">•</span>
                                    <span>{formatDuration(activeVideo.duration)}</span>
                                </>
                            )}
                            {activeVideo.video_quality === '4K' && (
                                <>
                                    <span className="text-white/40">•</span>
                                    <span className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-bold border border-white/20">4K UHD</span>
                                </>
                            )}
                        </div>

                        {/* Description */}
                        {showDescription && (
                            <p className="text-sm md:text-lg text-white/80 leading-relaxed line-clamp-3 md:line-clamp-3 font-medium max-w-xl drop-shadow-md text-pretty">
                                {activeVideo.description}
                            </p>
                        )}

                        {/* Buttons */}
                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            <Link
                                href={`/watch/${activeVideo.id}`}
                                className="flex items-center gap-2 md:gap-3 bg-white text-black px-8 py-3.5 md:px-10 md:py-4 rounded-lg font-bold text-sm md:text-lg hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
                            >
                                <Play className="fill-black w-5 h-5 md:w-6 md:h-6" />
                                Play
                            </Link>

                            <button
                                onClick={() => {
                                    // Could open a modal or just navigate to watch page but maybe focus on info
                                    // usually scroll to details or open modal. For now, link to watch page as "More Info"
                                    // or just a secondary action.
                                    window.location.href = `/watch/${activeVideo.id}`;
                                }}
                                className="flex items-center gap-2 md:gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3.5 md:px-8 md:py-4 rounded-lg font-bold text-sm md:text-lg transition-all hover:scale-105 active:scale-95 border border-white/10"
                            >
                                <Info className="w-5 h-5 md:w-6 md:h-6" />
                                More Info
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Navigation Arrows (Hidden on Mobile) */}
            <div className="absolute inset-y-0 right-0 z-30 flex items-center pr-4 md:pr-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:pointer-events-auto hidden md:flex">
                <button
                    onClick={handleNext}
                    className="p-3 rounded-full bg-black/30 hover:bg-black/60 border border-white/10 text-white backdrop-blur-sm transition-all hover:scale-110"
                >
                    <ChevronRight className="w-8 h-8" />
                </button>
            </div >
            <div className="absolute inset-y-0 left-0 z-30 flex items-center pl-4 md:pl-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:pointer-events-auto hidden md:flex">
                <button
                    onClick={handlePrev}
                    className="p-3 rounded-full bg-black/30 hover:bg-black/60 border border-white/10 text-white backdrop-blur-sm transition-all hover:scale-110"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
            </div>

            {/* Bottom Controls / Indicators */}
            <div className="absolute bottom-6 md:bottom-20 right-6 md:right-20 z-30 flex items-center gap-4">
                {/* Mute Toggle */}
                {showVideo && activeVideo.trailer_url && (
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
                    >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                )}
                {/* Explicit Age Rating (Left side sometimes) */}
                <div className="hidden md:flex bg-black/40 border-l-[3px] border-white/80 py-1 pl-3 pr-8 text-white text-sm font-medium backdrop-blur-md">
                    {activeVideo.content_rating || 'U/A 13+'}
                </div>
            </div>
        </div >
    );
}
