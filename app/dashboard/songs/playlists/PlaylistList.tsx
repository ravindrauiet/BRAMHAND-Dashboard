'use client';

import { deletePlaylist } from '@/app/actions/playlists';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Playlist {
    id: number;
    name: string;
    isPublic: boolean;
    user: {
        fullName: string;
    };
    _count: {
        songs: number;
    };
}

export default function PlaylistList({ playlists }: { playlists: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleDelete(id: number) {
        if (!confirm('Delete this playlist?')) return;
        setLoading(true);
        const res = await deletePlaylist(id);
        if (res.success) {
            router.refresh();
        } else {
            alert('Failed');
        }
        setLoading(false);
    }

    return (
        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-4 font-medium text-gray-500">Name</th>
                        <th className="p-4 font-medium text-gray-500">Creator</th>
                        <th className="p-4 font-medium text-gray-500">Songs</th>
                        <th className="p-4 font-medium text-gray-500">Visibility</th>
                        <th className="p-4 font-medium text-gray-500">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {playlists.map((p: any) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                            <td className="p-4 font-medium">{p.name}</td>
                            <td className="p-4 text-gray-600">{p.user.fullName}</td>
                            <td className="p-4 text-gray-600">{p._count.songs}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs ${p.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {p.isPublic ? 'Public' : 'Private'}
                                </span>
                            </td>
                            <td className="p-4">
                                <button
                                    onClick={() => handleDelete(p.id)}
                                    disabled={loading}
                                    className="text-red-500 hover:text-red-700 font-medium text-sm"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {playlists.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">No playlists found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
