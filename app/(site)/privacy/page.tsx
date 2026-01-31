export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-[#D4AF37]/30">
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-[#D4AF37] mb-6">Privacy Policy</h1>
                        <p className="text-gray-400">Last updated: January 31, 2026</p>
                    </div>

                    <div className="space-y-12 text-gray-300 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-serif text-white mb-4">1. Information We Collect / जानकारी जो हम एकत्र करते हैं</h2>
                            <p className="mb-4">
                                At Tirhuta, we collect information to provide a better experience for our community. This includes:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Identity & Verification:</strong> Mobile numbers and emails for OTP-based secure login.</li>
                                <li><strong>Creator Data:</strong> For our creators, we securely process PAN card details and bank information for monetization and earnings payouts.</li>
                                <li><strong>Device Information:</strong> We collect FCM tokens to send you notifications about new releases from your favorite Mithila artists.</li>
                                <li><strong>Engagement Data:</strong> Your watch history, likes, and follows help us recommend the best Maithili films, music, and cultural programs.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-white mb-4">2. How We Use Information / हम जानकारी का उपयोग कैसे करते हैं</h2>
                            <p className="mb-4">
                                Your data is used to empower the Mithila ecosystem:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Monetization:</strong> We use engagement metrics (views/likes) to calculate and distribute transparent earnings to our content creators.</li>
                                <li><strong>Personalization:</strong> To curate content in Maithili, Angika, Magahi, and other regional languages tailored to your preferences.</li>
                                <li><strong>Communication:</strong> Using Firebase (FCM) to keep you connected with the latest cultural updates.</li>
                            </ul>
                        </section>

                        <section className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                            <h2 className="text-2xl font-serif text-[#D4AF37] mb-4">Data Security & Sovereignty</h2>
                            <p>
                                We prioritize the security of Mithila's digital heritage. Your profile and financial data are protected with industry-standard encryption. We do not sell your personal data to third parties.
                            </p>
                        </section>

                        <section className="text-center border-t border-white/10 pt-12">
                            <p className="text-sm text-gray-500">
                                Contact our Data Protection Officer at <span className="text-white">privacy@tirhuta.com</span> for any concerns.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
