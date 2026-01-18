import { fetchPublicApi } from '@/lib/api';
import { PublicNavbar } from '@/components/site/PublicNavbar';
import Image from 'next/image';
import { Play, Music, Mic2 } from 'lucide-react';
import Link from 'next/link';

export default async function MusicPage() {
    const [songsData, genresData] = await Promise.all([
        fetchPublicApi('/music/songs?is_featured=true&limit=20'),
        fetchPublicApi('/music/genres')
    ]);

    const featuredSongs = songsData.songs || [];
    const categories = genresData.genres || [];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black">

            <div className="pt-20 pb-12 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-12 relative h-64 rounded-3xl overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600">
                    <div className="absolute inset-0 flex items-center p-12">
                        <div className="relative z-10 text-white space-y-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                                <Music className="w-3 h-3" /> Music Streaming
                            </span>
                            <h1 className="text-5xl font-black">Discover New Sounds</h1>
                            <p className="text-lg text-white/80 max-w-xl">Stream thousands of songs from your favorite artists. High quality audio, curated playlists, and more.</p>
                        </div>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-20 transform translate-y-12 translate-x-12">
                        <Music className="w-96 h-96" />
                    </div>
                </div>

                {/* Genres */}
                <div className="mb-12">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Mic2 className="w-5 h-5 text-purple-500" />
                        Browse Genres
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {categories.map((genre: any) => (
                            <Link
                                href="#"
                                key={genre.id}
                                className="flex-shrink-0 w-40 h-24 bg-slate-200 dark:bg-slate-800 rounded-xl relative overflow-hidden group hover:scale-105 transition-transform"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-transparent z-10"></div>
                                <span className="absolute bottom-3 left-3 text-white font-bold z-20">{genre.name}</span>
                                <div className="absolute top-0 right-0 p-2 opacity-50">
                                    <Music className="w-12 h-12 rotate-12" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Popular Songs Grid */}
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Popular Tracks</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                        {featuredSongs.map((song: any) => (
                            <div key={song.id} className="group cursor-pointer">
                                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-800 shadow-lg group-hover:shadow-xl transition-all mb-4">
                                    <Image
                                        src={song.coverImageUrl || song.cover_image_url || '/placeholder-music.jpg'}
                                        alt={song.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                                            <Play className="w-5 h-5 fill-current ml-1" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-500 transition-colors">{song.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{song.artist}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
