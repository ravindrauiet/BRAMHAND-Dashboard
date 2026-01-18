'use client';

import { useState, useRef } from 'react';
import { Edit, Trash2, Eye, EyeOff, Play, Pause, Music, Search, Filter, Mic2, Disc, TrendingUp, Star, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { deleteSong, toggleSongStatus } from '@/app/dashboard/songs/actions';

interface SongListProps {
    songs: any[];
    genres: any[];
}

export function SongList({ songs, genres }: SongListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState<string>('all');
    const [playingSongId, setPlayingSongId] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const filteredSongs = songs.filter(song => {
        const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (song.album && song.album.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesGenre = selectedGenre === 'all' || song.genreId.toString() === selectedGenre;
        return matchesSearch && matchesGenre;
    });

    const togglePlay = (song: any) => {
        if (playingSongId === song.id) {
            audioRef.current?.pause();
            setPlayingSongId(null);
        } else {
            if (audioRef.current) {
                audioRef.current.src = song.audioUrl;
                audioRef.current.play();
                setPlayingSongId(song.id);
            }
        }
    };

    return (
        <div className="space-y-6">
            <audio ref={audioRef} onEnded={() => setPlayingSongId(null)} className="hidden" />

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search songs, artists, or albums..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select
                        className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white min-w-[200px]"
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                    >
                        <option value="all">All Genres</option>
                        {genres.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Song Table */}
            <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Track</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Details</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Tags</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Status</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {filteredSongs.map((song) => (
                                <tr key={song.id} className="group hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 max-w-[300px]">
                                        <div className="flex items-center space-x-4">
                                            <div
                                                className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer group-hover:ring-2 ring-blue-500/50 transition-all shadow-md bg-slate-100 dark:bg-slate-800"
                                                onClick={() => togglePlay(song)}
                                            >
                                                {song.coverImageUrl ? (
                                                    <Image
                                                        src={song.coverImageUrl}
                                                        alt={song.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Music className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                )}
                                                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${playingSongId === song.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                    {playingSongId === song.id ?
                                                        <Pause className="w-5 h-5 text-white fill-current" /> :
                                                        <Play className="w-5 h-5 text-white fill-current" />
                                                    }
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                                    {song.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                        <Mic2 className="w-3 h-3" />
                                                        {song.artist}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                                <Disc className="w-3 h-3" />
                                                {song.album || 'Single'}
                                            </span>
                                            <span className="px-2 py-0.5 w-fit rounded-full text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                {song.genre.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5 items-start">
                                            {song.isTrending && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                                    <TrendingUp className="w-3 h-3" /> Trending
                                                </span>
                                            )}
                                            {song.isFeatured && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                                                    <Star className="w-3 h-3" /> Featured
                                                </span>
                                            )}
                                            {!song.isTrending && !song.isFeatured && (
                                                <span className="text-xs text-slate-400 italic">Standard</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${song.isActive
                                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                                : 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                                                }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${song.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                            {song.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <form action={toggleSongStatus.bind(null, song.id, !song.isActive)}>
                                                <button
                                                    className={`p-2 rounded-lg transition-colors ${song.isActive ? 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                                                    title={song.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    {song.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>
                                            </form>
                                            <Link href={`/dashboard/songs/${song.id}`} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit">
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <form action={deleteSong.bind(null, song.id)}>
                                                <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSongs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        <Music className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="text-lg font-medium">No songs found</p>
                                        <p className="text-sm">Try adjusting your search or filters</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
