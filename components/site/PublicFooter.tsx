import { Facebook, Twitter, Instagram, Youtube, Play } from 'lucide-react';
import Link from 'next/link';

export function PublicFooter() {
    return (
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-black pt-16 pb-8">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg group-hover:shadow-blue-500/25 transition-all">
                                <Play className="w-4 h-4 fill-current" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">
                                Stream<span className="text-blue-600">App</span>
                            </span>
                        </Link>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                            The ultimate destination for streaming high-quality video content. Join our community of creators and viewers today.
                        </p>
                        <div className="flex gap-4">
                            <SocialLink icon={Facebook} href="#" />
                            <SocialLink icon={Twitter} href="#" />
                            <SocialLink icon={Instagram} href="#" />
                            <SocialLink icon={Youtube} href="#" />
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-2">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Discover</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                            <li><Link href="/browse" className="hover:text-blue-600 transition-colors">Browse</Link></li>
                            <li><Link href="/trending" className="hover:text-blue-600 transition-colors">Trending</Link></li>
                            <li><Link href="/music" className="hover:text-blue-600 transition-colors">Music</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Support</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                            <li><Link href="/help" className="hover:text-blue-600 transition-colors">Help Center</Link></li>
                            <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* App Download */}
                    <div className="lg:col-span-4">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Get the App</h4>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="flex items-center gap-3 px-4 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-left">
                                <div className="text-2xl"></div>
                                <div>
                                    <div className="text-[10px] uppercase font-medium text-slate-400">Download on the</div>
                                    <div className="font-bold leading-none">App Store</div>
                                </div>
                            </button>
                            <button className="flex items-center gap-3 px-4 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-left">
                                <div className="text-xl">▶</div>
                                <div>
                                    <div className="text-[10px] uppercase font-medium text-slate-400">Get it on</div>
                                    <div className="font-bold leading-none">Google Play</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
                    <p>© 2024 StreamApp. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span>Made with ❤️ for Creators</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ icon: Icon, href }: { icon: any, href: string }) {
    return (
        <Link href={href} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white transition-all">
            <Icon className="w-4 h-4" />
        </Link>
    );
}
