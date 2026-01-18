import { getVideoGenres, getMusicGenres } from './actions';
import { GenreList } from './GenreList';

export default async function GenresPage() {
    const [videoGenres, musicGenres] = await Promise.all([getVideoGenres(), getMusicGenres()]);

    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 transition-colors duration-300">Genres</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage, organize, and localize video and music genres.</p>
            </div>

            <GenreList videoGenres={videoGenres} musicGenres={musicGenres} />
        </div>
    );
}
