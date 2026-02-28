'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Film, Plus, Trash2, GripVertical, CheckCircle, XCircle, Loader2, Search } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Episode {
    id: number;
    title: string;
    thumbnailUrl?: string;
    episodeNumber: number | null;
    seasonNumber: number;
    duration: number | null;
    isActive: boolean;
    viewsCount: number;
    creatorName: string;
    createdAt: string;
}

interface EpisodesManagerProps {
    seriesId: number;
    token: string;
}

async function fetchApi(url: string, token: string, options?: RequestInit) {
    const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options?.headers || {}),
        },
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
}

export default function EpisodesManager({ seriesId, token }: EpisodesManagerProps) {
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<Episode[]>([]);
    const [searching, setSearching] = useState(false);
    const [assigning, setAssigning] = useState<number | null>(null);
    const [removing, setRemoving] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Episode number assignment modal
    const [assignModal, setAssignModal] = useState<{ video: Episode; episodeNumber: number; seasonNumber: number } | null>(null);

    const loadEpisodes = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchApi(`/api/admin/series/${seriesId}/episodes`, token);
            setEpisodes(data.episodes || []);
        } catch (err) {
            setError('Failed to load episodes');
        } finally {
            setLoading(false);
        }
    }, [seriesId, token]);

    useEffect(() => {
        loadEpisodes();
    }, [loadEpisodes]);

    const handleSearch = async () => {
        if (search.trim().length < 2) return;
        setSearching(true);
        try {
            const data = await fetchApi(`/api/admin/videos?type=VIDEO`, token);
            const filtered = (data.videos || []).filter((v: Episode) =>
                v.title.toLowerCase().includes(search.toLowerCase())
            );
            setSearchResults(filtered.slice(0, 10));
        } catch {
            setError('Search failed');
        } finally {
            setSearching(false);
        }
    };

    const openAssignModal = (video: Episode) => {
        const nextEp = episodes.length + 1;
        const highestSeason = episodes.length > 0 ? Math.max(...episodes.map(e => e.seasonNumber || 1)) : 1;
        setAssignModal({ video, episodeNumber: nextEp, seasonNumber: highestSeason });
    };

    const handleAssign = async () => {
        if (!assignModal) return;
        setAssigning(assignModal.video.id);
        try {
            await fetchApi(`/api/admin/videos/${assignModal.video.id}/series`, token, {
                method: 'PATCH',
                body: JSON.stringify({
                    seriesId,
                    episodeNumber: assignModal.episodeNumber,
                    seasonNumber: assignModal.seasonNumber,
                }),
            });
            setSuccess(`"${assignModal.video.title}" added as Episode ${assignModal.episodeNumber}`);
            setAssignModal(null);
            setSearch('');
            setSearchResults([]);
            await loadEpisodes();
        } catch {
            setError('Failed to assign video');
        } finally {
            setAssigning(null);
        }
    };

    const handleRemove = async (videoId: number, title: string) => {
        if (!confirm(`Remove "${title}" from this series?`)) return;
        setRemoving(videoId);
        try {
            await fetchApi(`/api/admin/videos/${videoId}/series`, token, {
                method: 'PATCH',
                body: JSON.stringify({ seriesId: null, episodeNumber: null, seasonNumber: 1 }),
            });
            setSuccess(`Removed from series`);
            await loadEpisodes();
        } catch {
            setError('Failed to remove episode');
        } finally {
            setRemoving(null);
        }
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '—';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6">
            {/* Alerts */}
            {error && (
                <div className="flex items-center gap-2 bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                    <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-200">✕</button>
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 bg-green-900/40 border border-green-700 text-green-300 px-4 py-3 rounded-lg text-sm">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    {success}
                    <button onClick={() => setSuccess('')} className="ml-auto text-green-400 hover:text-green-200">✕</button>
                </div>
            )}

            {/* Add Episode search */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-purple-400" />
                    Add Existing Video as Episode
                </h3>

                <div className="flex gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search video by title…"
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={searching || search.trim().length < 2}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                    >
                        {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Search
                    </button>
                </div>

                {/* Search results */}
                {searchResults.length > 0 && (
                    <ul className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                        {searchResults.map((video) => {
                            const alreadyAdded = episodes.some(e => e.id === video.id);
                            return (
                                <li key={video.id} className="flex items-center gap-3 bg-gray-900/60 rounded-lg p-3">
                                    {video.thumbnailUrl && (
                                        <Image
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            width={60}
                                            height={40}
                                            className="rounded object-cover w-[60px] h-[40px] flex-shrink-0"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{video.title}</p>
                                        <p className="text-xs text-gray-500">{video.creatorName}</p>
                                    </div>
                                    <button
                                        onClick={() => openAssignModal(video)}
                                        disabled={alreadyAdded || assigning === video.id}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex-shrink-0"
                                    >
                                        {alreadyAdded ? 'Added' : 'Add'}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Episode assignment modal */}
            {assignModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md space-y-4">
                        <h3 className="text-base font-semibold text-white">Assign to Series</h3>
                        <p className="text-sm text-gray-400 truncate">"{assignModal.video.title}"</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Season</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={assignModal.seasonNumber}
                                    onChange={(e) => setAssignModal(p => p ? { ...p, seasonNumber: parseInt(e.target.value) || 1 } : null)}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Episode Number</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={assignModal.episodeNumber}
                                    onChange={(e) => setAssignModal(p => p ? { ...p, episodeNumber: parseInt(e.target.value) || 1 } : null)}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setAssignModal(null)}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={!!assigning}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                            >
                                {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Current episodes list */}
            <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <Film className="w-4 h-4 text-blue-400" />
                    Episodes ({episodes.length})
                </h3>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                    </div>
                ) : episodes.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <Film className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No episodes yet. Add videos above.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {episodes.map((ep) => (
                            <div key={ep.id} className="flex items-center gap-4 bg-gray-800/50 border border-gray-700 rounded-xl p-3 hover:border-gray-600 transition-colors">
                                <GripVertical className="w-4 h-4 text-gray-600 flex-shrink-0" />

                                <div className="flex-shrink-0 text-center w-12">
                                    <p className="text-xs text-gray-500">S{ep.seasonNumber}</p>
                                    <p className="text-sm font-bold text-purple-400">E{ep.episodeNumber ?? '?'}</p>
                                </div>

                                {ep.thumbnailUrl ? (
                                    <Image
                                        src={ep.thumbnailUrl}
                                        alt={ep.title}
                                        width={72}
                                        height={48}
                                        className="rounded object-cover w-[72px] h-[48px] flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-[72px] h-[48px] rounded bg-gray-700 flex-shrink-0 flex items-center justify-center">
                                        <Film className="w-5 h-5 text-gray-500" />
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white font-medium truncate">{ep.title}</p>
                                    <p className="text-xs text-gray-500">
                                        {ep.creatorName} · {formatDuration(ep.duration)} · {ep.viewsCount.toLocaleString()} views
                                    </p>
                                </div>

                                <div className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${ep.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                    {ep.isActive ? 'Live' : 'Hidden'}
                                </div>

                                <button
                                    onClick={() => handleRemove(ep.id, ep.title)}
                                    disabled={removing === ep.id}
                                    title="Remove from series"
                                    className="flex-shrink-0 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {removing === ep.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
