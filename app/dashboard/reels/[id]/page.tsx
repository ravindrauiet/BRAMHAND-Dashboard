import VideoFormPage from '../form';

export default function EditVideoPage({ params }: { params: { id: string } }) {
    return <VideoFormPage params={params} />;
}
