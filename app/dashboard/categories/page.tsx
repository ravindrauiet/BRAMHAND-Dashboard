import { getCategories } from './actions';
import { CategoryList } from './CategoryList';

export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 transition-colors duration-300">Categories</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage, organize, and localize video categories.</p>
            </div>

            <CategoryList categories={categories} />
        </div>
    );
}
