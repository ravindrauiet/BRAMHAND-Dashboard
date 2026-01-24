import { SeriesEditor } from '../SeriesEditor';
import { fetchFromApi } from '@/lib/api';

export default async function NewSeriesPage() {
    const categoriesData = await fetchFromApi('/videos/categories');
    const creatorsData = await fetchFromApi('/admin/creators'); // Assuming exist

    const categories = categoriesData.categories || [];
    const creators = creatorsData.creators || [];

    return (
        <SeriesEditor categories={categories} creators={creators} />
    );
}
