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
        const v = data.video;

        // Map snake_case from DB to camelCase for VideoEditor
        video = {
            ...v,
            categoryId: v.category_id,
            creatorId: v.creator_id,
            seriesId: v.series_id,
            episodeNumber: v.episode_number,
            seasonNumber: v.season_number,
            // Ensure booleans are actually booleans/numbers as expected
            isFeatured: !!v.is_featured,
            isTrending: !!v.is_trending,
            isActive: !!v.is_active,
        };
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

    // Fetch Series
    const seriesData = await fetchFromApi('/series?is_active=true');
    const series = seriesData.series || [];

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <VideoEditor
                video={video}
                categories={categories}
                creators={flattenedCreators}
                seriesList={series}
            />
            {isEditing && video && <CommentsManager videoId={video.id} />}
        </div>
    );
}
