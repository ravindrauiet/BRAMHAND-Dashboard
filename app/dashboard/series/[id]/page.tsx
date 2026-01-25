import { SeriesEditor } from '../SeriesEditor';
import { fetchFromApi } from '@/lib/api';
import { notFound } from 'next/navigation';

export default async function EditSeriesPage({ params }: { params: { id: string } }) {
    // Parallel fetching for performance
    const [seriesData, categoriesData, creatorsData] = await Promise.all([
        fetchFromApi(`/series/${params.id}`),
        fetchFromApi('/videos/categories'),
        fetchFromApi('/admin/creators')
    ]);

    if (!seriesData.success || !seriesData.series) {
        notFound();
    }

    const series = {
        ...seriesData.series,
        categoryId: seriesData.series.category_id,
        creatorId: seriesData.series.creator_id,
        thumbnailUrl: seriesData.series.thumbnail_url,
        coverImageUrl: seriesData.series.cover_image_url,
        isActive: !!seriesData.series.is_active,
        isFeatured: !!seriesData.series.is_featured
    };
    const categories = categoriesData.categories || [];
    const creators = creatorsData.creators || [];

    return (
        <SeriesEditor
            series={series}
            categories={categories}
            creators={creators}
        />
    );
}
