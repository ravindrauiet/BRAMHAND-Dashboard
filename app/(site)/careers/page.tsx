import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react';

export default function CareersPage() {
    const jobs = [
        {
            title: "Maithili Content Specialist",
            location: "Darbhanga / Remote",
            type: "Full-time",
            desc: "Help curate and verify the highest quality Maithili films and literature."
        },
        {
            title: "Senior Product Designer",
            location: "Remote",
            type: "Full-time",
            desc: "Design the next generation of cultural streaming experiences for the global Mithila diaspora."
        },
        {
            title: "Cultural Media Manager",
            location: "Patna / Hybrid",
            type: "Full-time",
            desc: "Lead our engagement strategies for traditional folk music and contemporary web series."
        },
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-[#D4AF37]/30">
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-[#D4AF37] mb-6">
                        Build the Future of Mithila
                    </h1>
                    <p className="text-xl text-gray-400 font-light mb-16 max-w-2xl mx-auto">
                        We are looking for visionaries, technologists, and cultural enthusiasts to join Tirhuta in digitizing the soul of Maithili heritage.
                    </p>

                    <div className="grid gap-6 text-left">
                        {jobs.map((job, idx) => (
                            <div key={idx} className="group bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-[#D4AF37]/50 transition-all cursor-pointer">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="flex-grow">
                                        <h3 className="text-2xl font-semibold mb-2 group-hover:text-[#D4AF37] transition-colors">{job.title}</h3>
                                        <p className="text-gray-400 mb-4 text-sm leading-relaxed">{job.desc}</p>
                                        <div className="flex gap-4 text-xs text-gray-500 uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                                            <span className="flex items-center gap-1"><Clock size={12} /> {job.type}</span>
                                        </div>
                                    </div>
                                    <button className="flex items-center gap-2 text-[#D4AF37] text-sm font-bold py-3 px-8 rounded-xl border border-[#D4AF37]/30 group-hover:bg-[#D4AF37] group-hover:text-black transition-all self-start">
                                        Apply <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 p-12 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-3xl border border-[#D4AF37]/20 backdrop-blur-sm">
                        <h2 className="text-3xl font-serif mb-4 text-white">Join the Movement</h2>
                        <p className="text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
                            Whether you're a developer or a storyteller, if you care about regional representation, we want to hear from you.
                        </p>
                        <a href="mailto:careers@tirhuta.com" className="text-[#D4AF37] font-bold border-b border-[#D4AF37] pb-1 hover:text-white hover:border-white transition-all">
                            careers@tirhuta.com
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}
