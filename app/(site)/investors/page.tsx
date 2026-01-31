export default function InvestorsPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-[#D4AF37]/30">
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-[#D4AF37] mb-6">Investor Relations</h1>
                        <p className="text-gray-400 text-xl font-light">Investing in the World's First Cultural Super-App.</p>
                    </div>

                    <div className="space-y-16">
                        <div className="prose prose-invert max-w-none text-gray-400 text-lg leading-relaxed">
                            <p>
                                Tirhuta, a Brahmand Mantra initiative, is positioned at the intersection of cultural heritage and scalable tech. We serve the 100M+ Maithili-speaking population globally, offering a unified platform for streaming, music, and community engagement.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 text-center">
                            <div className="p-10 bg-white/5 rounded-3xl border border-white/10 hover:border-[#D4AF37]/30 transition-colors">
                                <div className="text-[#D4AF37] text-4xl font-bold mb-2">100M+</div>
                                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Addressable Market</p>
                            </div>
                            <div className="p-10 bg-white/5 rounded-3xl border border-white/10 hover:border-[#D4AF37]/30 transition-colors">
                                <div className="text-[#D4AF37] text-4xl font-bold mb-2">Multi-Cat</div>
                                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Streaming Ecosystem</p>
                            </div>
                            <div className="p-10 bg-white/5 rounded-3xl border border-white/10 hover:border-[#D4AF37]/30 transition-colors">
                                <div className="text-[#D4AF37] text-4xl font-bold mb-2">Creator</div>
                                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Led Growth</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h2 className="text-3xl font-serif text-white">Market Opportunity</h2>
                            <p className="text-gray-400">
                                While mainstream platforms focus on broad languages, Tirhuta deep-dives into the rich, untapped niches of Maithili, Magahi, and Angika. Our Creator Dashboard and built-in monetization tools ensure a sustainable supply of premium, locally-relevant content that domestic audiences crave.
                            </p>
                            <div className="bg-[#D4AF37]/5 border-l-4 border-[#D4AF37] p-8 rounded-r-3xl">
                                <h3 className="text-white font-bold mb-2">The "Mithila Hub" Strategy</h3>
                                <p className="text-sm text-gray-400">Our roadmap includes expanding from video streaming into cultural commerce and hyper-local news, creating an all-in-one digital home for the Mithila community.</p>
                            </div>
                        </div>

                        <div className="text-center py-12 border-t border-white/10">
                            <p className="text-gray-500 mb-6">For pitch decks and financial summaries, reach out to our corporate strategy team.</p>
                            <a href="mailto:investors@tirhuta.com" className="bg-[#D4AF37] text-black font-bold py-4 px-10 rounded-full hover:scale-105 transition-all inline-block">
                                investors@tirhuta.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
