import { db } from '@/lib/db';
import { SongEditor } from './SongEditor';
import { redirect } from 'next/navigation';

export default async function SongFormPage({ params }: { params: { id?: string } }) {
    const isEditing = !!params.id;
    let song = null;

    if (isEditing) {
        song = await db.song.findUnique({ where: { id: parseInt(params.id!) } });
        if (!song) redirect('/dashboard/songs');
    }

    const genres = await db.musicGenre.findMany();

    return (
        <SongEditor
            song={song}
            genres={genres}
        />
    );
}
