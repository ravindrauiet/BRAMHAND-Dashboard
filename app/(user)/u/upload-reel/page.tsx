import { db } from '@/lib/db';
import { PublicNavbar } from '@/components/site/PublicNavbar';
import UploadReelForm from './form';

export default async function UploadReelPage() {
    const categories = await db.videoCategory.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black">
            <PublicNavbar />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Upload a Reel</h1>
                        <p className="text-slate-500 dark:text-slate-400">Share your short moments with the world.</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-100 dark:border-slate-800">
                        <UploadReelForm categories={categories} />
                    </div>
                </div>
            </div>
        </div>
    );
}
