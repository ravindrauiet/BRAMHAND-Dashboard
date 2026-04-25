import { fetchPublicApi } from '@/lib/api';
import { PublicNavbar } from '@/components/site/PublicNavbar';
import { PublicFooter } from '@/components/site/PublicFooter';
import { Rocket, ShieldCheck, Zap, Globe } from 'lucide-react';
import UploadForm from '../upload-reel/form';

export default async function UploadVideoPage() {
    let categories: any[] = [];
    try {
        const data = await fetchPublicApi('/videos/categories');
        categories = data.categories || [];
    } catch {
        // continue with empty list — form handles empty gracefully
    }

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-slate-900 dark:text-slate-100 flex flex-col relative overflow-x-hidden">
            <PublicNavbar />

            {/* Ambient glows */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-indigo-500/8 dark:bg-indigo-500/12 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-purple-500/8 dark:bg-purple-500/12 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-sky-500/5 dark:bg-sky-500/8 blur-[100px] rounded-full" />
            </div>

            <main className="flex-1 pt-28 pb-24 flex flex-col">
                <div className="max-w-4xl mx-auto px-4 w-full space-y-12">

                    {/* ── Hero ── */}
                    <div className="text-center space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20 shadow-sm">
                            <Rocket className="w-3 h-3" /> Creator Studio · Video Upload
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
                            Upload your{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                                Masterpiece
                            </span>
                        </h1>

                        <p className="text-xs md:text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest max-w-md mx-auto leading-loose">
                            Share your story with the world. High-quality uploads up to 5 GB.
                        </p>

                        {/* Feature pills */}
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                            {[
                                { icon: ShieldCheck, label: 'Secure upload' },
                                { icon: Zap,         label: 'Fast CDN delivery' },
                                { icon: Globe,       label: 'Global audience' },
                            ].map(({ icon: Icon, label }) => (
                                <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                    <Icon className="w-3 h-3 text-indigo-500" /> {label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ── Form card ── */}
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[40px] p-6 md:p-10 shadow-2xl shadow-indigo-500/10 border border-white/50 dark:border-white/10 ring-1 ring-inset ring-white/20 dark:ring-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                        <UploadForm categories={categories} type="VIDEO" />
                    </div>

                    {/* ── Guidelines ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-4 animate-in fade-in duration-700 delay-300">
                        {[
                            {
                                emoji: '🎬',
                                title: 'Best Format',
                                desc: 'H.264 MP4 at 1080p for maximum compatibility and quality.',
                            },
                            {
                                emoji: '🖼️',
                                title: 'Add a Thumbnail',
                                desc: '16:9 JPG or PNG. A great cover boosts clicks by up to 40%.',
                            },
                            {
                                emoji: '🏷️',
                                title: 'Tag it well',
                                desc: 'Relevant tags help your video appear in search & recommendations.',
                            },
                        ].map((item) => (
                            <div key={item.title} className="flex gap-4 items-start p-5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                                <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white mb-1">{item.title}</h3>
                                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
