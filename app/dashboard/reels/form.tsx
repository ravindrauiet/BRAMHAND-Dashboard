import { db } from '@/lib/db';
import { VideoEditor } from './VideoEditor';
import CommentsManager from '@/components/dashboard/CommentsManager';
import { redirect } from 'next/navigation';

export default async function VideoFormPage({ params }: { params: { id?: string } }) {
    const isEditing = !!params.id;
    let video = null;

    if (isEditing) {
        video = await db.video.findUnique({ where: { id: parseInt(params.id!) } });
        if (!video) redirect('/dashboard/videos');
    }

    const categories = await db.videoCategory.findMany();
    const creators = await db.user.findMany({ where: { isCreator: true } });

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
