import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserPlaylists } from '@/app/actions/userPlaylists';
import { PublicNavbar } from '@/components/site/PublicNavbar';
import UserPlaylistList from '@/components/user/UserPlaylistList';

export default async function PlaylistsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/auth/signin');

    const { playlists } = await getUserPlaylists();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black">
            <PublicNavbar />
            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Playlists</h1>
                </div>

                <UserPlaylistList playlists={playlists || []} />
            </div>
        </div>
    );
}
