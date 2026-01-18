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
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-md">
                        <h3 className="font-bold mb-4">Create New Playlist</h3>
                        <form action={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input name="name" type="text" required className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" placeholder="My Awesome Playlist" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input name="isPublic" type="checkbox" id="isPublic" />
                                <label htmlFor="isPublic" className="text-sm">Make Public</label>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => setIsCreating(false)} className="px-3 py-1 text-sm text-slate-500">Cancel</button>
                                <button type="submit" className="px-3 py-1 text-sm bg-blue-600 text-white rounded">Create</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        <Plus className="w-4 h-4" />
                        Create Playlist
                    </button>
                )}
            </div>

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {playlists.map((p) => (
                    <div key={p.id} className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all">
                        <div className="aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                            {p.coverImageUrl ? (
                                <img src={p.coverImageUrl} className="w-full h-full object-cover" />
                            ) : (
                                <Music className="w-12 h-12 text-slate-300" />
                            )}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.preventDefault(); handleDelete(p.id); }} className="p-2 bg-white/90 text-red-600 rounded-full hover:bg-white shadow">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-lg truncate">{p.name}</h3>
                            <p className="text-sm text-slate-500">{p._count.songs} Songs</p>
                            <p className="text-xs text-slate-400 mt-2">{p.isPublic ? 'Public' : 'Private'}</p>
                        </div>
                    </div>
                ))}
            </div>

            {playlists.length === 0 && !isCreating && (
                <div className="text-center py-12 text-slate-500">
                    You don't have any playlists yet.
                </div>
            )}
        </div>
    );
}
