import { fetchFromApi } from '@/lib/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PublicNavbar } from '@/components/site/PublicNavbar';
import Image from 'next/image';
import Link from 'next/link';

export default async function HistoryPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/auth/signin');

    // Fetch from Backend API
    const response = await fetchFromApi('/user/history?limit=50');
    const apiHistory = response.history || [];

    // Map API snake_case to component camelCase
    const history = apiHistory.map((item: any) => ({
        id: item.view_id,
        createdAt: item.viewed_at,
        lastPosition: item.last_position,
        video: {
            id: item.id, // video id
            title: item.title,
            thumbnailUrl: item.thumbnail_url,
            duration: item.duration,
            description: item.description,
            creator: {
                fullName: item.creator_name || 'Unknown'
            }
        }
    }));

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black">
            <PublicNavbar />
            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Watch History</h1>

                <div className="space-y-4">
                    {history.map((view: any) => (
                        <Link href={`/watch/${view.video.id}`} key={view.id} className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                            <div className="relative w-48 aspect-video rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                                <Image
                                    src={view.video.thumbnailUrl || '/placeholder-thumb.jpg'}
                                    alt={view.video.title}
                                    fill
                                    className="object-cover"
                                />
                                {view.lastPosition > 0 && view.video.duration && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                        <div
                                            className="h-full bg-blue-600"
                                            style={{ width: `${Math.min(100, (view.lastPosition / (view.video.duration * 60)) * 100)}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 py-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white line-clamp-1">{view.video.title}</h3>
                                    {view.lastPosition > 0 && view.video.duration && (
                                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded uppercase tracking-wider">
                                            {Math.round((view.lastPosition / (view.video.duration * 60)) * 100)}% Watched
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 mt-0.5">{view.video.creator.fullName}</p>
                                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-2">
                                    <span>Watched {new Date(view.createdAt).toLocaleString()}</span>
                                    {view.lastPosition > 0 && <span>•</span>}
                                    {view.lastPosition > 0 && <span>Resumes at {Math.floor(view.lastPosition / 60)}:{(view.lastPosition % 60).toString().padStart(2, '0')}</span>}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-1">{view.video.description}</p>
                            </div>
                        </Link>
                    ))}
                    {history.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            No watch history yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
