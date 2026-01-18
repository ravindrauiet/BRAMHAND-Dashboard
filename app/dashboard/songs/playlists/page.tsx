import { db } from '@/lib/db';
import PlaylistList from './PlaylistList';

export default async function PlaylistsPage() {
    const playlists = await db.playlist.findMany({
        include: {
            user: true,
            _count: {
                select: { songs: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Playlists</h1>
            </div>
            <PlaylistList playlists={playlists} />
        </div>
    );
}
