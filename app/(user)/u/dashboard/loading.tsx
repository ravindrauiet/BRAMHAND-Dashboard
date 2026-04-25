export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f]">
            <div className="h-16 bg-white/80 dark:bg-[#0a0a0f]/80 border-b border-slate-200/50 dark:border-white/5" />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 ring-4 ring-white dark:ring-white/10" />
                        <div className="space-y-2">
                            <div className="h-9 w-56 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                            <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                        <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 mx-1" />
                        <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    </div>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white/70 dark:bg-white/5 p-5 rounded-2xl border border-slate-200/60 dark:border-white/10">
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl mb-3" />
                            <div className="h-2.5 w-20 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                            <div className="h-7 w-14 bg-slate-200 dark:bg-slate-800 rounded" />
                        </div>
                    ))}
                </div>

                {/* Content layout */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white/50 dark:bg-white/5 rounded-3xl p-3 border border-slate-200/50 dark:border-white/5 space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                            ))}
                            <div className="mt-4 h-36 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 space-y-6">
                        <div className="flex justify-between mb-6">
                            <div className="h-7 w-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                            <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white/70 dark:bg-white/5 flex gap-4 p-4 rounded-2xl border border-slate-200/60 dark:border-white/10">
                                    <div className="w-32 aspect-video rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                                    <div className="flex-1 space-y-2 py-1">
                                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                                        <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
                                        <div className="h-2.5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded mt-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
