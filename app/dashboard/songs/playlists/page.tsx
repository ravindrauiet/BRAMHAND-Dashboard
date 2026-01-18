import { getPlaylists } from './actions';
import PlaylistList from './PlaylistList';

export default async function PlaylistsPage() {
    const playlists = await getPlaylists();

    // Map to expected format if needed, but the backend query was designed to match 
    // minimal needs. Backend returns: 
    // { id, name, description, coverImage, createdAt, creatorName, creatorImage, songCount }

    // Frontend component likely expects 'user' object and '_count' object if it was using Prisma types directly.
    // Let's adapt the data here to match the old shape if possible, or we might need to update PlaylistList.
    // Based on the old code:
    // include: { user: true, _count: { select: { songs: true } } }

    const adaptedPlaylists = playlists.map((p: any) => ({
        ...p,
        user: {
            fullName: p.creatorName,
            profileImage: p.creatorImage
        },
        _count: {
            songs: p.songCount
        }
    }));

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Playlists</h1>
            </div>
            <PlaylistList playlists={adaptedPlaylists} />
        </div>
    );
}
