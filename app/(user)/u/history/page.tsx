import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { PublicNavbar } from '@/components/site/PublicNavbar';
import Image from 'next/image';
import Link from 'next/link';

export default async function HistoryPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/auth/signin');
    const userId = parseInt((session as any).user.id);

    const history = await db.videoView.findMany({
        where: { userId: userId },
        include: { video: { include: { creator: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black">
            <PublicNavbar />
            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Watch History</h1>

                <div className="space-y-4">
                    {history.map((view) => (
                        <Link href={`/watch/${view.video.id}`} key={view.id} className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                            <div className="relative w-48 aspect-video rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                                <Image
                                    src={view.video.thumbnailUrl || '/placeholder-thumb.jpg'}
                                    alt={view.video.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 py-1">
                                <h3 className="font-semibold text-lg text-slate-900 dark:text-white line-clamp-1">{view.video.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">{view.video.creator.fullName}</p>
                                <p className="text-xs text-slate-400 mt-2">Watched {new Date(view.createdAt).toLocaleString()}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">{view.video.description}</p>
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
