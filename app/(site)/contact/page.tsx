import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-[#D4AF37]/30">
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-[#D4AF37] mb-6">Connect with Us</h1>
                        <p className="text-gray-400 text-xl font-light">Join the revolution of regional digital media. We're here to help.</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-20">
                        {/* Contact Info */}
                        <div className="space-y-12">
                            <div className="flex gap-8 group">
                                <div className="w-16 h-16 rounded-3xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shrink-0 group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                                    <Mail size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-serif mb-2">Write to us</h3>
                                    <p className="text-gray-400 group-hover:text-white transition-colors">support@tirhuta.com</p>
                                    <p className="text-gray-400 group-hover:text-white transition-colors">creators@tirhuta.com</p>
                                </div>
                            </div>

                            <div className="flex gap-8 group">
                                <div className="w-16 h-16 rounded-3xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shrink-0 group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                                    <Phone size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-serif mb-2">Speak to us</h3>
                                    <p className="text-gray-400 group-hover:text-white transition-colors">+91-500-TIRHUTA</p>
                                    <p className="text-gray-600 text-sm mt-1">Available 10:00 AM - 07:00 PM IST</p>
                                </div>
                            </div>

                            <div className="flex gap-8 group">
                                <div className="w-16 h-16 rounded-3xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shrink-0 group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                                    <MapPin size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-serif mb-2">Visit us</h3>
                                    <p className="text-gray-400 group-hover:text-white transition-colors leading-relaxed">
                                        Mithila Cultural Hub,<br />
                                        Patna Towers, Bihar,<br />
                                        India - 800001
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] opacity-5 blur-[80px]"></div>
                            <form className="space-y-8 relative z-10">
                                <div className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Identity</label>
                                            <input type="text" className="w-full bg-transparent border-b border-white/20 py-3 focus:border-[#D4AF37] outline-none transition-all placeholder:text-gray-700" placeholder="Your Full Name" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Communication</label>
                                            <input type="email" className="w-full bg-transparent border-b border-white/20 py-3 focus:border-[#D4AF37] outline-none transition-all placeholder:text-gray-700" placeholder="Email Address" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Inquiry Subject</label>
                                        <input type="text" className="w-full bg-transparent border-b border-white/20 py-3 focus:border-[#D4AF37] outline-none transition-all placeholder:text-gray-700" placeholder="What can we help you with?" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Detailed Message</label>
                                        <textarea rows={4} className="w-full bg-transparent border-b border-white/20 py-3 focus:border-[#D4AF37] outline-none transition-all resize-none placeholder:text-gray-700" placeholder="Type your message here..."></textarea>
                                    </div>
                                </div>
                                <button className="w-full bg-[#D4AF37] hover:bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 group/btn">
                                    Iniate Conversation <Send size={20} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
