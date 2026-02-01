import { fetchPublicApi } from '@/lib/api';
import { PublicNavbar } from '@/components/site/PublicNavbar';
import { PublicFooter } from '@/components/site/PublicFooter';
import { Sparkles, Video, Clapperboard, Rocket } from 'lucide-react';
import UploadForm from '../upload-reel/form';

export default async function UploadVideoPage() {
    const data = await fetchPublicApi('/videos/categories');
    const categories = data.categories || [];

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-slate-900 dark:text-slate-100 flex flex-col">
            <PublicNavbar />

            <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
                </div>

                <div className="max-w-4xl mx-auto px-4 relative">
                    <div className="mb-12 text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/10 animate-in fade-in slide-in-from-bottom-2 duration-700">
                            <Rocket className="w-3 h-3" /> Creator Studio
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                            Upload your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Masterpiece</span>
                        </h1>
                        <p className="text-xs md:text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest max-w-lg mx-auto leading-relaxed">
                            Share your story with the world. We support high-quality uploads up to 5GB per video.
                        </p>
                    </div>

                    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl rounded-[48px] p-2 md:p-10 shadow-2xl shadow-indigo-500/5 border border-white dark:border-white/10 relative overflow-hidden">
                        <div className="relative z-10">
                            <UploadForm categories={categories} type="VIDEO" />
                        </div>
                    </div>

                    {/* Features Help */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 px-4">
                        {[
                            { icon: <Video className="w-5 h-5" />, title: "High Definition", desc: "Support for 4K and HDR content" },
                            { icon: <Clapperboard className="w-5 h-5" />, title: "Creator First", desc: "Keep 100% of your ownership" },
                            { icon: <Sparkles className="w-5 h-5" />, title: "Smart SEO", desc: "Automatic tag generation" }
                        ].map((f, i) => (
                            <div key={i} className="flex flex-col items-center text-center space-y-3 p-6 rounded-3xl bg-white/30 dark:bg-white/5 border border-white/50 dark:border-white/5">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                    {f.icon}
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">{f.title}</h3>
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter leading-tight">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
