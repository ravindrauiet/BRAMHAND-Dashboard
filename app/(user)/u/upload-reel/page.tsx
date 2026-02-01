import { fetchPublicApi } from '@/lib/api';
import { PublicNavbar } from '@/components/site/PublicNavbar';
import { PublicFooter } from '@/components/site/PublicFooter';
import { Rocket, Sparkles, Video, Clapperboard } from 'lucide-react';
import UploadReelForm from './form';

export default async function UploadReelPage() {
    // Need to use public categories endpoint which we just added
    const data = await fetchPublicApi('/videos/categories');
    const categories = data.categories || [];

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-slate-900 dark:text-slate-100 flex flex-col">
            <PublicNavbar />

            <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                    <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-indigo-500/5 blur-[100px] rounded-full" />
                    <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-purple-500/5 blur-[100px] rounded-full" />
                </div>

                <div className="max-w-4xl mx-auto px-4 relative">
                    <div className="mb-12 text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/10 animate-in fade-in slide-in-from-bottom-2 duration-700">
                            <Rocket className="w-3 h-3" /> Short Form Studio
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                            Create a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Reel</span>
                        </h1>
                        <p className="text-xs md:text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest max-w-lg mx-auto leading-relaxed">
                            Share your moments with a bite-sized story. Perfect for mobile viewing.
                        </p>
                    </div>

                    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl rounded-[48px] p-2 md:p-10 shadow-2xl shadow-indigo-500/5 border border-white dark:border-white/10 relative overflow-hidden">
                        <div className="relative z-10">
                            <UploadReelForm categories={categories} />
                        </div>
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
