'use client';

import { Play, Heart } from 'lucide-react';
import Image from 'next/image';
import { useMusicPlayer } from '@/components/site/providers/MusicPlayerContext';

export function PlayButton({ song, variant = 'primary', className = '' }: { song: any, variant?: 'primary' | 'card', className?: string }) {
    const { playSong, currentSong, isPlaying } = useMusicPlayer();

    const isCurrent = currentSong?.id === song.id;
    const isPlayingCurrent = isCurrent && isPlaying;

    const navToPlay = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        playSong(song);
    };

    if (variant === 'primary') {
        return (
            <button
                onClick={navToPlay}
                className={`group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] overflow-hidden ${className}`}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                {isPlayingCurrent ? (
                    <span className="relative z-10">Pause</span>
                ) : (
                    <>
                        <Play className="w-6 h-6 fill-current relative z-10" />
                        <span className="relative z-10">Listen Now</span>
                    </>
                )}
            </button>
        );
    }

    // Card variant
    return (
        <button
            onClick={navToPlay}
            className={`w-14 h-14 bg-white rounded-full flex items-center justify-center text-black shadow-lg hover:scale-110 transition-transform ${className}`}
        >
            {isPlayingCurrent ? (
                // Simple pause icon for card
                <div className="flex gap-1">
                    <span className="w-1.5 h-4 bg-black rounded-full" />
                    <span className="w-1.5 h-4 bg-black rounded-full" />
                </div>
            ) : (
                <Play className="w-6 h-6 fill-current ml-1" />
            )}
        </button>
    );
}

export function TrendingSongCard({ song, rank, queue = [] }: { song: any, rank: number, queue?: any[] }) {
    const { playSong } = useMusicPlayer();

    return (
        <div onClick={() => playSong(song, queue)} className="group relative flex-shrink-0 w-64 snap-start cursor-pointer">
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-xl shadow-black/50">
                <Image
                    src={song.cover_image_url || '/placeholder-music.jpg'}
                    alt={song.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
                    <PlayButton song={song} variant="card" />
                    <button className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                        <Heart className="w-5 h-5" />
                    </button>
                </div>
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-xs font-bold text-amber-400 border border-amber-500/30">
                    #{rank}
                </div>
            </div>
            <h3 className="text-lg font-bold text-white truncate group-hover:text-amber-400 transition-colors">{song.title}</h3>
            <p className="text-slate-400 truncate">{song.artist}</p>
        </div>
    );
}

export function SongCard({ song, queue = [] }: { song: any, queue?: any[] }) {
    const { playSong, currentSong, isPlaying } = useMusicPlayer();
    const isCurrent = currentSong?.id === song.id;

    return (
        <div onClick={() => playSong(song, queue)} className="group p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer">
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-lg">
                <Image
                    src={song.cover_image_url || '/placeholder-music.jpg'}
                    alt={song.title}
                    fill
                    className={`object-cover ${isCurrent && isPlaying ? 'scale-110' : ''}`}
                />
                {/* Overlay */}
                <div className={`absolute inset-0 bg-black/40 ${isCurrent ? 'opacity-100 bg-black/60' : 'opacity-0 group-hover:opacity-100'} transition-all flex items-center justify-center`}>
                    <button
                        className={`w-10 h-10 ${isCurrent ? 'bg-purple-500 text-white' : 'bg-cyan-500 text-white'} rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}
                    >
                        {isCurrent && isPlaying ? (
                            <div className="flex gap-1 h-3 items-center">
                                <span className="w-1 h-3 bg-white animate-bounce py-0.5" style={{ animationDelay: '0ms' }} />
                                <span className="w-1 h-3 bg-white animate-bounce py-0.5" style={{ animationDelay: '150ms' }} />
                                <span className="w-1 h-3 bg-white animate-bounce py-0.5" style={{ animationDelay: '300ms' }} />
                            </div>
                        ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                    </button>
                </div>
            </div>
            <h3 className={`font-bold truncate ${isCurrent ? 'text-purple-400' : 'text-white'}`}>{song.title}</h3>
            <p className="text-sm text-slate-400 truncate mb-2">{song.artist}</p>
        </div>
    );
}
