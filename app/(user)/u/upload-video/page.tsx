import { fetchPublicApi } from '@/lib/api';
import { PublicNavbar } from '@/components/site/PublicNavbar';
import { Sparkles } from 'lucide-react';
import UploadForm from '../upload-reel/form';

export default async function UploadVideoPage() {
    const data = await fetchPublicApi('/videos/categories');
    const categories = data.categories || [];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-slate-100">
            <PublicNavbar />

            <div className="pt-24 pb-12 max-w-5xl mx-auto px-4 relative">
                <div className="max-w-xl mx-auto">
                    <div className="mb-6 text-center space-y-1">
                        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] font-bold uppercase tracking-widest border border-indigo-500/5">
                            Studio
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">
                            Upload <span className="text-indigo-600">Video</span>
                        </h1>
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                            Share your content with the community.
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/60 dark:border-white/10">
                        <UploadForm categories={categories} type="VIDEO" />
                    </div>
                </div>
            </div>
        </div>
    );
}
