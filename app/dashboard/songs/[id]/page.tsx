import SongFormPage from '../form';

export default function EditSongPage({ params }: { params: { id: string } }) {
    return <SongFormPage params={params} />;
}
