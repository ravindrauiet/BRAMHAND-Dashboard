'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Music, Loader2, Save, ArrowLeft, Image as ImageIcon, Link as LinkIcon, Type, Mic2, Disc, Star, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { createSong, updateSong } from './actions';

interface SongEditorProps {
    song?: any;
    genres: any[];
}

export function SongEditor({ song, genres }: SongEditorProps) {
    const isEditing = !!song;
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Initialize state
    const [formData, setFormData] = useState({
        title: song?.title || '',
        artist: song?.artist || '',
        album: song?.album || '',
        audioUrl: song?.audioUrl || '',
        coverImageUrl: song?.coverImageUrl || '',
        genreId: song?.genreId || '',
        isActive: song?.isActive ?? true,
        isTrending: song?.isTrending ?? false,
        isFeatured: song?.isFeatured ?? false,
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const selectedGenreName = genres.find(g => g.id.toString() === formData.genreId.toString())?.name || 'Genre';

    return (
        <form
            action={isEditing ? updateSong.bind(null, song.id) : createSong}
            onSubmit={() => setIsLoading(true)}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
            <div className="lg:col-span-2 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{isEditing ? 'Edit Song' : 'New Song'}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your track details and metadata.</p>
                    </div>
                    <Link href="/dashboard/songs" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </div>

                {/* Main Form Card */}
                <div className="glass-card p-8 rounded-2xl space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <Type className="w-4 h-4 text-blue-500" /> Track Title
                            </label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                required
                                placeholder="Enter song title..."
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <Mic2 className="w-4 h-4 text-purple-500" /> Artist
                            </label>
                            <input
                                name="artist"
                                value={formData.artist}
                                onChange={(e) => handleChange('artist', e.target.value)}
                                required
                                placeholder="Artist name..."
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <Disc className="w-4 h-4 text-pink-500" /> Album
                            </label>
                            <input
                                name="album"
                                value={formData.album}
                                onChange={(e) => handleChange('album', e.target.value)}
                                placeholder="Album name (optional)"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Media Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-cyan-500" /> Audio URL
                            </label>
                            <input
                                name="audioUrl"
                                value={formData.audioUrl}
                                onChange={(e) => handleChange('audioUrl', e.target.value)}
                                required
                                placeholder="https://... (mp3/wav)"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-amber-500" /> Cover Image URL
                            </label>
                            <input
                                name="coverImageUrl"
                                value={formData.coverImageUrl}
                                onChange={(e) => handleChange('coverImageUrl', e.target.value)}
                                placeholder="https://..."
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white font-mono text-sm"
                            />
                        </div>
                    </div>

                    {/* Genre Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                            <Music className="w-4 h-4 text-emerald-500" /> Genre
                        </label>
                        <div className="relative">
                            <select
                                name="genreId"
                                value={formData.genreId}
                                onChange={(e) => handleChange('genreId', e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-slate-900 dark:text-white"
                            >
                                <option value="">Select Genre</option>
                                {genres.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="flex flex-wrap gap-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => handleChange('isActive', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 transition-colors">Active Status</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="isTrending"
                                    checked={formData.isTrending}
                                    onChange={(e) => handleChange('isTrending', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-amber-600 transition-colors">Trending</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={(e) => handleChange('isFeatured', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-purple-600 transition-colors">Featured</span>
                        </label>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {isEditing ? 'Save Changes' : 'Publish Song'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Live Preview Column */}
            <div className="space-y-6">
                <div className="sticky top-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Music className="w-5 h-5 text-pink-500" /> Live Preview
                    </h3>

                    {/* Preview Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 flex flex-col items-center text-center">
                        <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-lg mb-6 ring-4 ring-white dark:ring-slate-800">
                            {formData.coverImageUrl ? (
                                <Image src={formData.coverImageUrl} alt="Cover Preview" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Music className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                                </div>
                            )}
                            {/* Play Overlay */}
                            <button
                                type="button"
                                onClick={togglePlay}
                                disabled={!formData.audioUrl}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                            >
                                <div className="w-12 h-12 bg-white/30 backdrop-blur rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                                    {isPlaying ? (
                                        <Pause className="w-6 h-6 text-white fill-current" />
                                    ) : (
                                        <Play className="w-6 h-6 text-white ml-1 fill-current" />
                                    )}
                                </div>
                            </button>
                        </div>

                        <div className="space-y-1 mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1">{formData.title || 'Untitled Track'}</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">{formData.artist || 'Unknown Artist'}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{formData.album || 'Single'} • {selectedGenreName}</p>
                        </div>

                        {/* Audio Element */}
                        <audio
                            ref={audioRef}
                            src={formData.audioUrl}
                            onEnded={() => setIsPlaying(false)}
                            onPause={() => setIsPlaying(false)}
                            onPlay={() => setIsPlaying(true)}
                            className="hidden"
                        />

                        {/* Status Badges */}
                        <div className="flex items-center justify-center gap-2">
                            {formData.isTrending && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-semibold border border-amber-200 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> Trending
                                </span>
                            )}
                            {formData.isFeatured && (
                                <span className="text-[10px] bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold border border-purple-200 flex items-center gap-1">
                                    <Star className="w-3 h-3" /> Featured
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
