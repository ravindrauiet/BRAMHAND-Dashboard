'use client';

import { Play, TrendingUp, Clock, MoreVertical, Heart, Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface LandingViewProps {
    featuredVideos: any[];
    trendingVideos: any[];
    latestVideos: any[];
}

export function LandingView({ featuredVideos, trendingVideos, latestVideos }: LandingViewProps) {
    const heroVideo = featuredVideos[0];
    const otherFeatured = featuredVideos.slice(1);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black pt-16">

            {/* Hero Section */}
            {heroVideo && (
                <section className="relative h-[80vh] w-full overflow-hidden">
                    <div className="absolute inset-0">
                        {/* Fallback to thumbnail if no video implementation yet, or just an image for now */}
                        <Image
                            src={heroVideo.thumbnailUrl || '/placeholder-hero.jpg'}
                            alt={heroVideo.title}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                        <div className="max-w-4xl space-y-4 animate-in slide-in-from-bottom-10 duration-700 fade-in">
                            <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                                {heroVideo.category?.name || 'Featured'}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-lg">
                                {heroVideo.title}
                            </h1>
                            <p className="text-lg text-slate-200 line-clamp-2 max-w-2xl drop-shadow-md">
                                {heroVideo.description}
                            </p>
                            <div className="flex items-center gap-4 pt-4">
                                <Link
                                    href={`/watch/${heroVideo.id}`}
                                    className="flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:scale-105 transition-transform"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    Watch Now
                                </Link>
                                <button className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors">
                                    <Heart className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

                {/* Trending Section */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-rose-500" />
                            Trending Now
                        </h2>
                        <Link href="/trending" className="text-blue-600 font-medium hover:underline">View All</Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {trendingVideos.map((video) => (
                            <VideoCard key={video.id} video={video} />
                        ))}
                    </div>
                </section>

                {/* Latest Videos */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-6 h-6 text-blue-500" />
                            Recently Added
                        </h2>
                        <Link href="/latest" className="text-blue-600 font-medium hover:underline">View All</Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {latestVideos.map((video) => (
                            <VideoCard key={video.id} video={video} />
                        ))}
                    </div>
                </section>

                {/* Footer Preview */}
                <footer className="border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
                            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                                <li>About Us</li>
                                <li>Careers</li>
                                <li>Press</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Support</h4>
                            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                                <li>Help Center</li>
                                <li>Terms of Service</li>
                                <li>Privacy Policy</li>
                            </ul>
                        </div>
                    </div>
                    <div className="text-center text-slate-400 text-sm">
                        © 2024 Tirhuta. Not really reserved.
                    </div>
                </footer>
            </div>
        </div>
    );
}

function VideoCard({ video }: { video: any }) {
    return (
        <Link href={`/watch/${video.id}`} className="group block relative">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800 shadow-lg group-hover:shadow-2xl transition-all duration-300">
                <Image
                    src={video.thumbnailUrl || '/placeholder-thumb.jpg'}
                    alt={video.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-900 scale-0 group-hover:scale-110 transition-transform duration-300 delay-75">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-medium rounded-md">
                    {formatDuration(video.duration)}
                </div>
            </div>

            <div className="pt-3 flex gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
                    {video.creator?.profileImage ? (
                        <Image src={video.creator.profileImage} alt="" width={40} height={40} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">?</div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-black dark:text-white font-semibold text-sm line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                        {video.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 truncate">
                        {video.creator?.fullName || 'Unknown Creator'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>{formatViews(video.viewsCount || 0)} views</span>
                        <span>•</span>
                        <span>{new Date(video.createdAt).toLocaleDateString('en-GB')}</span>
                    </div>
                </div>
                <button className="self-start text-slate-400 hover:text-slate-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>
        </Link>
    );
}

function formatDuration(seconds: number) {
    if (!seconds) return '00:00';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

function formatViews(views: number) {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
}
