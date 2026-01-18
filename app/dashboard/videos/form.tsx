import { fetchFromApi } from '@/lib/api';
import { getCreators } from '../creators/actions';
import { getCategories } from '../categories/actions';
import { VideoEditor } from './VideoEditor';
import CommentsManager from '@/components/dashboard/CommentsManager';
import { redirect } from 'next/navigation';

export default async function VideoFormPage({ params }: { params: { id?: string } }) {
    const isEditing = !!params.id;
    let video = null;

    if (isEditing) {
        const data = await fetchFromApi(`/admin/videos/${params.id}`);
        if (!data.success) redirect('/dashboard/videos');
        video = data.video;
    }

    const categories = await getCategories();
    const creators = await getCreators();

    // Transform creators to match expected shape if needed (VideoEditor expects User objects)
    // getCreators returns objects with { user: ... }, we might need to flatten or adjust VideoEditor
    // For now assuming VideoEditor handles the list of creators.
    const flattenedCreators = creators.map((c: any) => ({
        id: c.user.id || c.id, // Fallback if ID is separate
        fullName: c.user.fullName,
        profileImage: c.user.profileImage
    }));

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <VideoEditor
                video={video}
                categories={categories}
                creators={flattenedCreators}
            />
            {isEditing && video && <CommentsManager videoId={video.id} />}
        </div>
    );
}
