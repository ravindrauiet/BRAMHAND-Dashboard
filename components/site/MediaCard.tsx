'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, ChevronRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Helper Functions ---
const getThumbnail = (video: any) => {
    if (!video) return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop';
    return video.thumbnailUrl || video.thumbnail_url || video.coverImage || video.cover_image || video.coverImageUrl || video.cover_image_url || video.preview || video.preview_image || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop';
};

function formatDuration(seconds: number) {
    if (!seconds) return '0m';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    if (min > 60) {
        const h = Math.floor(min / 60);
        const m = min % 60;
        return `${h}h ${m}m`;
    }
    return `${min}m`;
}

function formatViews(views: number) {
    if (!views) return '0';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
}

interface MediaCardProps {
    video: any;
    type?: 'MOVIE' | 'SERIES';
    rank?: number;
    className?: string;
}

export function MediaCard({ video, type = 'MOVIE', rank, className }: MediaCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const hoverTimer = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        // "Smart Hover" - Wait 500ms to confirm intent
        hoverTimer.current = setTimeout(() => {
            setIsHovered(true);
        }, 500);
    };

    const handleMouseLeave = () => {
        if (hoverTimer.current) {
            clearTimeout(hoverTimer.current);
            hoverTimer.current = null;
        }
        setIsHovered(false);
    };

    const linkHref = type === 'SERIES' ? `/series/${video.id}` : `/watch/${video.id}`;
    // const creatorName = video.creator_name || video.creator?.fullName || 'Tirhuta Studios';

    return (
        <div
            className={cn("relative w-[200px] md:w-[240px] flex-shrink-0 aspect-[2/3] z-0 transition-all duration-300", className, isHovered ? "z-50" : "z-0")}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Base Card (Visible Default) */}
            <Link href={linkHref}>
                <div className="w-full h-full rounded-md overflow-hidden bg-slate-800 relative card-shadow border border-white/5">
                    <Image
                        src={getThumbnail(video)}
                        alt={video.title}
                        fill
                        className="object-cover"
                    />

                    {/* Overlay Gradient for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 transition-opacity duration-300" />

                    {/* Visible Title & Info (Base State) */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                        <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-md mb-1">{video.title}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-white/70 font-medium">
                            <span className="text-[#fbbf24] font-bold">{video.category_name || video.category?.name || (type === 'SERIES' ? 'TV Show' : 'Movie')}</span>
                            <span>•</span>
                            <span>{type === 'SERIES' ? 'Series' : new Date(video.created_at || Date.now()).getFullYear()}</span>
                        </div>
                    </div>

                    {/* Rank Badge */}
                    {rank && (
                        <div className="absolute -left-4 -top-2 text-[6rem] font-black text-[#0a0a14] stroke-white drop-shadow-lg leading-[0.6] z-10" style={{ WebkitTextStroke: '2px #fbbf24' }}>
                            {rank}
                        </div>
                    )}

                    {/* HD Badge */}
                    {video.video_quality === '4K' && (
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-[#fbbf24] border border-[#fbbf24]/30">
                            4K
                        </div>
                    )}
                </div>
            </Link>

            {/* Hover Expansion Card (Absolute) - Only renders when truly hovered */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1.15, y: -20 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} // Bezier for "premium" feel
                        className="absolute top-[-20%] left-[-20px] w-[280px] bg-[#141414] rounded-xl shadow-2xl overflow-hidden border border-white/10 z-50 origin-center"
                    >
                        {/* Preview Image/Video Area */}
                        <div className="relative h-40 w-full bg-slate-900">
                            <Image
                                src={getThumbnail(video)}
                                alt={video.title}
                                fill
                                className="object-cover"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />

                            <div className="absolute bottom-4 left-4 right-4">
                                <h4 className="font-bold text-white text-lg leading-tight shadow-black drop-shadow-md line-clamp-2">{video.title}</h4>
                            </div>
                        </div>

                        {/* Metadata & Actions */}
                        <div className="p-4 space-y-3 bg-[#141414]">
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <Link
                                        href={linkHref}
                                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-white/20"
                                    >
                                        <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                                    </Link>
                                    <button className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center hover:border-white text-white transition-colors">
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <Link
                                    href={linkHref}
                                    className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center hover:border-white text-white transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>

                            <div className="flex items-center gap-3 text-xs font-bold text-white/90">
                                <span className="text-green-400">{formatViews(video.views_count || 0)} Views</span>
                                <span className="border border-white/30 px-1.5 py-0.5 rounded text-[10px] uppercase text-white/70">
                                    {video.content_rating || 'U/A'}
                                </span>
                                <span>{type === 'SERIES' ? `${video.episodeCount || '?'} Episodes` : formatDuration(video.duration)}</span>
                                <span className="px-1.5 py-0.5 border border-white/30 rounded text-[9px] uppercase">HD</span>
                            </div>

                            <div className="flex flex-wrap gap-2 text-[11px] font-medium text-white/50">
                                {[video.category_name || video.category?.name || (type === 'SERIES' ? 'TV Show' : 'Movie'), 'Exciting', 'Trending'].map((tag, i) => (
                                    <span key={i} className="flex items-center">
                                        {i > 0 && <span className="mr-2 text-white/30">•</span>}
                                        <span className="text-white/70 hover:text-white transition-colors cursor-pointer">{tag}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
