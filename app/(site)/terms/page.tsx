export default function TermsPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-[#D4AF37]/30">
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-[#D4AF37] mb-6">Terms of Service</h1>
                        <p className="text-gray-400">Last updated: January 31, 2026</p>
                    </div>

                    <div className="space-y-12 text-gray-300 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-serif text-white mb-4">1. The Tirhuta Platform / तिरहुता प्लेटफॉर्म</h2>
                            <p className="mb-4">
                                Tirhuta is a digital ecosystem dedicated to the preservation and promotion of Mithila's cultural heritage. By using our services, you join a community committed to high-quality cinematic and musical experiences.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-white mb-4">2. For Content Creators / सामग्री निर्माताओं के लिए</h2>
                            <p className="mb-4">
                                We empower creators through a transparent monetization model:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Monetization:</strong> Eligibility is based on verification and engagement metrics. Total earnings are calculated based on view counts and platform-specified percentages.</li>
                                <li><strong>IP Rights:</strong> Creators retain ownership of their original works, while granting Tirhuta a license to distribute and promote this content globally.</li>
                                <li><strong>Conduct:</strong> Creators must ensure content is respectful of Mithila's cultural values and free from copyright infringement.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-white mb-4">3. User Conduct / उपयोगकर्ता आचरण</h2>
                            <p>
                                Users must not engage in data scraping, unauthorized distribution of premium content, or any activity that disrupts the platform's integrity. Unauthorized use of the "Brahmand Mantra" or "Tirhuta" trademarks is strictly prohibited.
                            </p>
                        </section>

                        <section className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                            <h2 className="text-2xl font-serif text-[#D4AF37] mb-4">Liability & Cultural Preservation</h2>
                            <p>
                                While Tirhuta strives for perfection, content availability depends on creator contributions. We act as a bridge between Mithila's traditions and modern digital consumption.
                            </p>
                        </section>

                        <section className="text-center italic text-gray-500 pt-8">
                            "Connecting the world to the heart of Mithila."
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
