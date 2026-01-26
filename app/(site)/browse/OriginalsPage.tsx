import { fetchPublicApi } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Star, Plus } from 'lucide-react';

export async function OriginalsPage() {
    // Fetch Featured Originals (Assuming is_featured=1 maps to originals for now)
    // In a real scenario, we might have a specific category_id for 'Originals' or a flag
    const [originalsData] = await Promise.all([
        fetchPublicApi('/videos?is_featured=true&exclude_series=true&limit=20') // Get plenty for the grid
    ]);

    const originals = originalsData?.videos || [];
    const hero = originals[0] || null;
    const collection = originals.slice(1);

    return (
        <div className="min-h-screen bg-[#050505] text-[#e5e5e5] font-serif selection:bg-[#D4AF37] selection:text-black">

            {/* HERO SECTION */}
            {hero && (
                <div className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden">
                    {/* Background Image with Parallax-like scale */}
                    <div className="absolute inset-0">
                        <Image
                            src={hero.thumbnail_url || hero.thumbnailUrl || '/placeholder-wide.jpg'}
                            alt={hero.title}
                            fill
                            className="object-cover opacity-60"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]" />
                    </div>

                    <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8 pt-20">
                        <div className="flex items-center justify-center gap-2 text-[#D4AF37] tracking-[0.3em] text-sm font-bold uppercase animate-fade-in-up">
                            <Star className="w-4 h-4 fill-current" />
                            Tirhuta Original
                            <Star className="w-4 h-4 fill-current" />
                        </div>

                        <h1 className="text-5xl md:text-8xl font-serif text-white drop-shadow-2xl tracking-tight leading-none animate-fade-in-up delay-100">
                            {hero.title}
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-sans font-light animate-fade-in-up delay-200">
                            {hero.description || "Experience the untold stories of Mithila in breathtaking 4K quality."}
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-4 animate-fade-in-up delay-300">
                            <Link
                                href={`/watch/${hero.id}`}
                                className="px-10 py-4 bg-[#D4AF37] text-black font-bold text-lg rounded-sm hover:bg-[#b5952f] transition-colors flex items-center gap-3 tracking-widest uppercase"
                            >
                                <Play className="w-5 h-5 fill-current" /> Watch Now
                            </Link>
                            <button className="px-10 py-4 border border-[#D4AF37]/50 text-[#D4AF37] font-bold text-lg rounded-sm hover:bg-[#D4AF37]/10 transition-colors flex items-center gap-3 tracking-widest uppercase">
                                <Plus className="w-5 h-5" /> Add to List
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* THE COLLECTION GRID */}
            <div className={`relative z-10 max-w-[1920px] mx-auto px-4 md:px-12 pb-32 space-y-16 ${hero ? '-mt-20' : 'pt-32'}`}>

                <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-6 mb-12">
                    <h2 className="text-3xl font-serif text-white">The Signature Collection</h2>
                    <span className="text-[#D4AF37] text-sm uppercase tracking-widest">Exclusively on Tirhuta</span>
                </div>

                {/* Mosaic Grid */}
                {collection.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {collection.map((item: any, idx: number) => {
                            // Highlighting every 3rd item as wide
                            const isWide = idx % 4 === 0 || idx % 4 === 3;

                            return (
                                <Link
                                    key={item.id}
                                    href={`/watch/${item.id}`}
                                    className={`group relative overflow-hidden rounded-sm bg-[#1a1a1a] border border-white/5 transition-transform duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#D4AF37]/10 ${isWide ? 'md:col-span-2 aspect-[21/9]' : 'aspect-square md:aspect-[4/3]'}`}
                                >
                                    <Image
                                        src={item.thumbnail_url || item.thumbnailUrl || '/placeholder-thumb.jpg'}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105 saturate-0 group-hover:saturate-100"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity" />

                                    <div className="absolute bottom-0 inset-x-0 p-8">
                                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <div className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-2 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                                                Tirhuta Original
                                            </div>
                                            <h3 className={`font-serif text-white leading-none mb-3 ${isWide ? 'text-4xl' : 'text-2xl'}`}>
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm line-clamp-2 max-w-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    <div className="py-20 text-center text-gray-500 font-sans">
                        <p>More originals coming soon.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
