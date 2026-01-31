export default function CookiesPage() {
    return (
        <main className="min-h-screen bg-black text-white">
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto prose prose-invert">
                    <h1 className="text-[#D4AF37] font-serif">Cookie Preferences</h1>
                    <p className="text-gray-400">Last updated: January 31, 2026</p>

                    <section className="mt-12 space-y-8 text-gray-300">
                        <div>
                            <h2 className="text-white text-2xl font-serif">What are cookies?</h2>
                            <p>Cookies are small text files that are used to store small pieces of information. They are stored on your device when the website is loaded on your browser.</p>
                        </div>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <h3 className="text-[#D4AF37] mt-0">Necessary Cookies</h3>
                            <p className="text-sm m-0">These cookies are essential for you to browse the website and use its features, such as accessing secure areas of the site.</p>
                        </div>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <h3 className="text-[#D4AF37] mt-0">Analytical Cookies</h3>
                            <p className="text-sm m-0">These cookies help us understand how visitors interact with the website by collecting and reporting information anonymously.</p>
                        </div>

                        <h2 className="text-white text-2xl font-serif">Managing Cookies</h2>
                        <p>Most browsers allow you to refuse to accept cookies and to delete cookies. The methods for doing so vary from browser to browser, and from version to version.</p>
                    </section>
                </div>
            </div>
        </main>
    );
}
