'use server';

import { fetchFromApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function getCategories() {
    const data = await fetchFromApi('/admin/categories');
    return data.success ? data.categories : [];
}

export async function deleteCategory(id: number) {
    try {
        await fetchFromApi(`/admin/categories/${id}`, { method: 'DELETE' });
        revalidatePath('/dashboard/categories');
    } catch (e) {
        console.error("Delete failed", e);
    }
}

export async function toggleCategoryStatus(id: number, isActive: boolean) {
    // Note: Backend might not support status for categories yet.
    // Implementing stub or call if endpoint exists.
    console.warn("Toggle Category Status not fully implemented on backend");
    /*
    await fetchFromApi(`/admin/categories/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive })
    });
    */
    revalidatePath('/dashboard/categories');
}

export async function createCategory(formData: FormData) {
    // Stub for create
}

export async function getVideoGenres() {
    return [];
}

export async function getMusicGenres() {
    const data = await fetchFromApi('/admin/genres');
    return data.success ? data.genres : [];
}
