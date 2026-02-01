'use client';

import { createPlaylist, deleteUserPlaylist } from '@/app/actions/userPlaylists';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, Trash2, Music } from 'lucide-react';

export default function UserPlaylistList({ playlists }: { playlists: any[] }) {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);

    async function handleCreate(formData: FormData) {
        const res = await createPlaylist(formData);
        if (res.success) {
            setIsCreating(false);
            // Router refresh happens in action but added here too for client state
            router.refresh();
        } else {
            alert(res.error);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Delete this playlist?')) return;
        const res = await deleteUserPlaylist(id);
        if (res.success) {
            router.refresh();
        } else {
            alert('Failed');
        }
    }

    return (
        <div>
            {/* Create Button / Form */}
            <div className="mb-8">
                {isCreating ? (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-2xl max-w-md animate-in zoom-in-95 duration-300">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-blue-600" /> New Collection
                        </h3>
                        <form action={handleCreate} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Playlist Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
                                    placeholder="e.g. Chill Vibes 2024"
                                />
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
                                <input
                                    name="isPublic"
                                    type="checkbox"
                                    id="isPublic"
                                    className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                                />
                                <label htmlFor="isPublic" className="text-sm font-bold text-slate-600 dark:text-slate-300 cursor-pointer">Make this collection public</label>
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-blue-600/20 active:scale-95">Create</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20 dark:shadow-none"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Playlist
                    </button>
                )}
            </div>

            {playlists.map((p) => (
                <div key={p.id} className="group bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-[40px] border border-slate-200/60 dark:border-white/10 overflow-hidden hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500 hover:-translate-y-2">
                    <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center relative">
                        {p.coverImageUrl ? (
                            <img src={p.coverImageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                            <Music className="w-20 h-20 text-blue-600/20 group-hover:rotate-12 transition-transform duration-500" />
                        )}
                        <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <button
                                onClick={(e) => { e.preventDefault(); handleDelete(p.id); }}
                                className="p-3 bg-white/90 dark:bg-black/90 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white shadow-xl backdrop-blur-md transition-all active:scale-90"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="p-8">
                        <h3 className="font-bold text-xl truncate text-slate-900 dark:text-white uppercase tracking-tight mb-1 group-hover:text-blue-600 transition-colors">
                            {p.name}
                        </h3>
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                {p.song_count ?? p._count?.songs ?? 0} Tracks
                            </p>
                            <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full ${p.isPublic ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'}`}>
                                {p.isPublic ? 'Public' : 'Private'}
                            </span>
                        </div>
                    </div>
                </div>
            ))}

            {playlists.length === 0 && !isCreating && (
                <div className="text-center py-12 text-slate-500">
                    You don't have any playlists yet.
                </div>
            )}
        </div>
    );
}
