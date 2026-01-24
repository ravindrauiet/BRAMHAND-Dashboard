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

    const series = seriesData.series;
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
