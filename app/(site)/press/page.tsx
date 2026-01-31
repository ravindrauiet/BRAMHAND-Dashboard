export default function PressPage() {
    const news = [
        {
            date: "Feb 01, 2026",
            title: "Tirhuta Music Ecosystem Reaches Milestone with 500+ Original Maithili Tracks",
            category: "Music",
            desc: "The platform's music branch continues to thrive as independent Maithili artists leverage the Tirhuta Creator Dashboard."
        },
        {
            date: "Jan 12, 2026",
            title: "Tirhuta Originals Announces 'Mithila Chronicles': A 10-Part Epic Docuseries",
            category: "Showcase",
            desc: "Brahmand Mantra greenlights the most expensive regional production to date, focusing on the history of Tirhut."
        },
        {
            date: "Dec 28, 2025",
            title: "Creator Monetization 2.0: Higher Payouts for High-Engagement Creators",
            category: "Corporate",
            desc: "Updated algorithms now reward creators based on deep community interaction and cultural impact."
        },
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-[#D4AF37]/30">
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-[#D4AF37] mb-12">Press & Media</h1>

                    <div className="space-y-16">
                        {news.map((item, idx) => (
                            <div key={idx} className="group border-b border-white/10 pb-12 transition-all">
                                <div className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] mb-4">{item.category}</div>
                                <h2 className="text-3xl md:text-4xl font-serif mb-4 group-hover:text-[#D4AF37]/80 transition-colors leading-tight">{item.title}</h2>
                                <p className="text-gray-400 mb-4 max-w-2xl font-light leading-relaxed">{item.desc}</p>
                                <div className="text-gray-600 text-sm font-medium">{item.date}</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 p-10 border border-white/10 rounded-3xl bg-white/[0.02] flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-2xl font-serif text-white mb-2">Media Center</h3>
                            <p className="text-gray-400">Access logo kits, HQ stills, and executive bios.</p>
                        </div>
                        <a href="mailto:press@tirhuta.com" className="text-white border border-white/30 py-3 px-8 rounded-full hover:bg-white hover:text-black transition-all font-bold">
                            press@tirhuta.com
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}
