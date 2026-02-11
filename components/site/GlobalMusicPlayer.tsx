'use client';

import { useMusicPlayer } from './providers/MusicPlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from 'lucide-react';
import Image from 'next/image';

export function GlobalMusicPlayer() {
    const { currentSong, isPlaying, togglePlay, currentTime, duration, seek, volume, changeVolume } = useMusicPlayer();

    if (!currentSong) return null;

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        seek(Number(e.target.value));
    };

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a14]/95 backdrop-blur-lg border-t border-white/10 px-6 py-3 animate-in slide-in-from-bottom-20 duration-300">
            <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-4">

                {/* Song Info */}
                <div className="flex items-center gap-4 w-1/4 min-w-[200px]">
                    <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-white/10">
                        <Image
                            src={currentSong.cover_image_url || '/placeholder-music.jpg'}
                            alt={currentSong.title}
                            fill
                            className={`object-cover ${isPlaying ? 'animate-pulse' : ''}`}
                        />
                    </div>
                    <div className="overflow-hidden">
                        <h4 className="font-bold text-white truncate text-sm md:text-base">{currentSong.title}</h4>
                        <p className="text-xs text-slate-400 truncate">{currentSong.artist}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
                    <div className="flex items-center gap-6">
                        <button className="text-slate-400 hover:text-white transition-colors">
                            <SkipBack className="w-5 h-5 fill-current" />
                        </button>
                        <button
                            onClick={togglePlay}
                            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                        >
                            {isPlaying ? (
                                <Pause className="w-5 h-5 fill-current" />
                            ) : (
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                            )}
                        </button>
                        <button className="text-slate-400 hover:text-white transition-colors">
                            <SkipForward className="w-5 h-5 fill-current" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 w-full text-xs text-slate-400 font-medium">
                        <span className="w-10 text-right">{formatTime(currentTime)}</span>
                        <div className="relative flex-1 h-1.5 bg-slate-800 rounded-full group cursor-pointer">
                            <div
                                className="absolute top-0 left-0 h-full bg-purple-500 rounded-full"
                                style={{ width: `${progressPercent}%` }}
                            />
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                style={{ left: `${progressPercent}%` }}
                            />
                        </div>
                        <span className="w-10 text-left">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Volume & Extras */}
                <div className="flex items-center justify-end gap-3 w-1/4 min-w-[200px] text-slate-400">
                    <Volume2 className="w-5 h-5" />
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full relative group">
                        <div
                            className="absolute top-0 left-0 h-full bg-slate-400 rounded-full"
                            style={{ width: `${volume * 100}%` }}
                        />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => changeVolume(parseFloat(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                    <button className="hover:text-white transition-colors ml-2">
                        <Maximize2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
