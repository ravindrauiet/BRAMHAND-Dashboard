import { Crown, ArrowRight, Mail, Check } from 'lucide-react';
import Image from 'next/image';

export default function PremiumPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-[#D4AF37] font-serif flex flex-col selection:bg-[#D4AF37] selection:text-black overflow-hidden relative">

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-[#050505] to-[#050505]" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />

            <main className="flex-grow flex flex-col items-center justify-center relative z-10 px-6 py-20 text-center">

                {/* Logo / Brand */}
                <div className="mb-12 animate-fade-in-down">
                    <div className="w-20 h-20 mx-auto relative mb-6">
                        <div className="absolute inset-0 bg-[#D4AF37] blur-[40px] opacity-20" />
                        <Crown className="w-full h-full stroke-[1] fill-[#D4AF37]/5" />
                    </div>
                </div>

                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
                    <span className="text-xs md:text-sm font-sans font-bold tracking-[0.4em] uppercase text-[#888] border border-[#333] px-4 py-2 rounded-full inline-block">
                        Coming Soon
                    </span>

                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#D4AF37] to-[#7a6015] drop-shadow-2xl">
                        Tirhuta +
                    </h1>

                    <p className="text-xl md:text-2xl font-sans font-light text-[#a1a1a1] max-w-2xl mx-auto leading-relaxed">
                        An ultra-exclusive cinematic experience. <br />
                        <span className="text-[#D4AF37]">Ad-free. 4K HDR. Early Access.</span>
                    </p>

                    {/* Feature List (Subtle) */}
                    <div className="flex flex-wrap justify-center gap-6 md:gap-12 py-8 text-sm font-sans tracking-widest text-[#666]">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#D4AF37]" /> Original Productions
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#D4AF37]" /> Offline Viewing
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#D4AF37]" /> Dolby Atmos
                        </div>
                    </div>

                    {/* Signup Form */}
                    <div className="max-w-md mx-auto relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/0 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                        <form className="relative flex shadow-2xl">
                            <div className="relative flex-grow">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
                                <input
                                    type="email"
                                    placeholder="Enter your email for early access"
                                    className="w-full bg-[#111] border border-[#333] text-white font-sans text-sm rounded-l-full py-5 pl-14 pr-4 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all placeholder:text-[#444]"
                                />
                            </div>
                            <button className="bg-[#D4AF37] hover:bg-[#b5952f] text-black font-sans font-bold uppercase tracking-wider text-xs px-8 rounded-r-full transition-all hover:pl-10 flex items-center group/btn">
                                Join
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                        <p className="text-[#444] text-[10px] font-sans mt-4 tracking-wide uppercase">
                            Limited spots available for beta launch
                        </p>
                    </div>
                </div>
            </main>

        </div>
    );
}
