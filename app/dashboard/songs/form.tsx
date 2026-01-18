import { fetchFromApi } from '@/lib/api';
import { getMusicGenres } from '../genres/actions';
import { SongEditor } from './SongEditor';
import { redirect } from 'next/navigation';

export default async function SongFormPage({ params }: { params: { id?: string } }) {
    const isEditing = !!params.id;
    let song = null;

    if (isEditing) {
        const data = await fetchFromApi(`/admin/songs/${params.id}`);
        if (!data.success) redirect('/dashboard/songs');
        song = data.song;
    }

    const genres = await getMusicGenres();

    return (
        <SongEditor
            song={song}
            genres={genres}
        />
    );
}
