import { Facebook, Twitter, Instagram, Youtube, Mail, ArrowRight, Globe, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function PublicFooter() {
    return (
        <footer className="bg-[#050505] text-[#a1a1a1] border-t border-[#1a1a1a] pt-20 pb-10 font-sans">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-12 lg:px-20">

                {/* Upper Section: Brand & Newsletter */}
                <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-24 mb-20">
                    <div className="lg:w-1/3 space-y-8">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 relative rounded-lg overflow-hidden">
                                <Image
                                    src="/logo/Tirhutra.jpeg"
                                    alt="Tirhuta Logo"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <span className="text-3xl font-serif font-bold text-white tracking-wide">Tirhuta</span>
                        </Link>
                        <p className="text-lg font-light leading-relaxed max-w-md text-[#888]">
                            Immerse yourself in the untold stories of Mithila. The premier destination for streaming high-quality cinematic experiences, tailored for the connoisseur.
                        </p>

                        <div className="flex gap-6 pt-4">
                            <SocialLink icon={Facebook} href="#" ariaLabel="Facebook" />
                            <SocialLink icon={Twitter} href="#" ariaLabel="Twitter" />
                            <SocialLink icon={Instagram} href="#" ariaLabel="Instagram" />
                            <SocialLink icon={Youtube} href="#" ariaLabel="Youtube" />
                        </div>
                    </div>

                    <div className="lg:w-1/3">
                        <h3 className="text-white font-serif text-2xl mb-6">Stay Connected</h3>
                        <p className="mb-6 font-light">Join our newsletter for exclusive premieres and behind-the-scenes access.</p>
                        <form className="flex gap-2">
                            <div className="relative flex-grow">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="w-full bg-[#111] border border-[#333] rounded-full py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                                />
                            </div>
                            <button className="bg-[#D4AF37] hover:bg-[#b5952f] text-black font-bold rounded-full w-14 h-14 flex items-center justify-center transition-all hover:scale-105">
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Middle Section: SEO Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-20 border-t border-[#1a1a1a] pt-16">

                    <div>
                        <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8 text-[#D4AF37]">Streaming</h4>
                        <ul className="space-y-4 text-sm">
                            <li><FooterLink href="/browse">All Content</FooterLink></li>
                            <li><FooterLink href="/browse?cat=series">TV Shows & Series</FooterLink></li>
                            <li><FooterLink href="/browse?cat=movies">Movies</FooterLink></li>
                            <li><FooterLink href="/browse?cat=originals">Tirhuta Originals</FooterLink></li>
                            <li><FooterLink href="/browse?cat=reels">Reels & Shorts</FooterLink></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8 text-[#D4AF37]">Popular Genres</h4>
                        <ul className="space-y-4 text-sm">
                            <li><FooterLink href="/browse?genre=action">Action & Adventure</FooterLink></li>
                            <li><FooterLink href="/browse?genre=drama">Drama & Romance</FooterLink></li>
                            <li><FooterLink href="/browse?genre=comedy">Comedy</FooterLink></li>
                            <li><FooterLink href="/browse?genre=thriller">Mystery & Thriller</FooterLink></li>
                            <li><FooterLink href="/browse?genre=sci-fi">Sci-Fi & Fantasy</FooterLink></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8 text-[#D4AF37]">Corporate</h4>
                        <ul className="space-y-4 text-sm">
                            <li><FooterLink href="/about">About Us</FooterLink></li>
                            <li><FooterLink href="/careers">Careers</FooterLink></li>
                            <li><FooterLink href="/press">Press & Media</FooterLink></li>
                            <li><FooterLink href="/investors">Investor Relations</FooterLink></li>
                            <li><FooterLink href="/contact">Contact Support</FooterLink></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8 text-[#D4AF37]">Legal</h4>
                        <ul className="space-y-4 text-sm">
                            <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
                            <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
                            <li><FooterLink href="/cookies">Cookie Preferences</FooterLink></li>
                            <li><FooterLink href="/sitemap">Sitemap</FooterLink></li>
                        </ul>
                    </div>

                    <div className="col-span-2 md:col-span-4 lg:col-span-1">
                        <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8 text-[#D4AF37]">Get the App</h4>
                        <div className="flex flex-col gap-3">
                            <button className="flex items-center gap-3 px-4 py-3 bg-[#111] hover:bg-[#222] border border-[#333] rounded-xl transition-all group w-full max-w-[200px]">
                                <div className="text-2xl text-white group-hover:text-[#D4AF37] transition-colors"></div>
                                <div>
                                    <div className="text-[9px] uppercase font-medium text-[#666]">Download on the</div>
                                    <div className="font-bold text-white text-sm leading-none">App Store</div>
                                </div>
                            </button>
                            <button className="flex items-center gap-3 px-4 py-3 bg-[#111] hover:bg-[#222] border border-[#333] rounded-xl transition-all group w-full max-w-[200px]">
                                <div className="text-xl text-white group-hover:text-[#D4AF37] transition-colors">▶</div>
                                <div>
                                    <div className="text-[9px] uppercase font-medium text-[#666]">Get it on</div>
                                    <div className="font-bold text-white text-sm leading-none">Google Play</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lower Section: Copyright */}
                <div className="pt-8 border-t border-[#1a1a1a] flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-medium text-[#666]">
                    <p>© 2024 Tirhuta Streaming Services. All rights reserved.</p>
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" /> English (India)
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Mumbai, India
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    );
}

function SocialLink({ icon: Icon, href, ariaLabel }: { icon: any, href: string, ariaLabel: string }) {
    return (
        <Link
            href={href}
            aria-label={ariaLabel}
            className="w-12 h-12 rounded-full bg-[#111] border border-[#333] flex items-center justify-center text-white hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all hover:scale-110"
        >
            <Icon className="w-5 h-5" />
        </Link>
    );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link href={href} className="hover:text-[#D4AF37] transition-colors hover:pl-1 block">
            {children}
        </Link>
    )
}
