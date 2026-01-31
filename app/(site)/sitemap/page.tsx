import Link from 'next/link';

export default function SitemapPage() {
    const links = [
        {
            category: "Main",
            items: [
                { name: "Home", href: "/" },
                { name: "Browse", href: "/browse" },
                { name: "About Us", href: "/about" },
            ]
        },
        {
            category: "Content",
            items: [
                { name: "Movies", href: "/browse?cat=movies" },
                { name: "Series", href: "/browse?cat=series" },
                { name: "Reels", href: "/browse?cat=reels" },
                { name: "Music", href: "/music" },
            ]
        },
        {
            category: "Corporate",
            items: [
                { name: "Careers", href: "/careers" },
                { name: "Press", href: "/press" },
                { name: "Investors", href: "/investors" },
                { name: "Contact", href: "/contact" },
            ]
        },
        {
            category: "Legal",
            items: [
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
                { name: "Cookies", href: "/cookies" },
            ]
        }
    ];

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-[#D4AF37] mb-16">Sitemap</h1>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        {links.map((group, idx) => (
                            <div key={idx}>
                                <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-8 text-[#D4AF37]">{group.category}</h3>
                                <ul className="space-y-4">
                                    {group.items.map((link, lIdx) => (
                                        <li key={lIdx}>
                                            <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
