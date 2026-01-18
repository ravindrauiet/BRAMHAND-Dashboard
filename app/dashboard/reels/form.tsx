import { fetchReelFormData } from './actions';
import { VideoEditor } from './VideoEditor';
import CommentsManager from '@/components/dashboard/CommentsManager';
import { redirect } from 'next/navigation';

export default async function VideoFormPage({ params }: { params: { id?: string } }) {
    const isEditing = !!params.id;
    const { categories, creators, video } = await fetchReelFormData(params.id);

    if (isEditing && !video) {
        redirect('/dashboard/videos');
    }

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <VideoEditor
                video={video}
                categories={categories}
                creators={creators}
            />
            {isEditing && video && <CommentsManager videoId={video.id} />}
        </div>
    );
}
