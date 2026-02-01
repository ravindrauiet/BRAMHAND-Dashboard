import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserPlaylists } from '@/app/actions/userPlaylists';
import { PublicNavbar } from '@/components/site/PublicNavbar';
import { PublicFooter } from '@/components/site/PublicFooter';
import UserPlaylistList from '@/components/user/UserPlaylistList';
import { PlaySquare, Sparkles } from 'lucide-react';

export default async function PlaylistsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/auth/signin');

    const { playlists } = await getUserPlaylists();

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-slate-900 dark:text-slate-100 flex flex-col">
            <PublicNavbar />

            <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/10 animate-in fade-in slide-in-from-bottom-2 duration-700">
                                <PlaySquare className="w-3 h-3" /> Library
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Collections</span>
                            </h1>
                            <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">
                                Organize your favorite tracks and videos into curated playlists.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl rounded-[48px] p-6 md:p-12 shadow-2xl shadow-indigo-500/5 border border-white dark:border-white/10">
                        <UserPlaylistList playlists={playlists || []} />
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
