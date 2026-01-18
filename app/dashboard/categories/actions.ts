'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getCategories() {
    try {
        return await db.videoCategory.findMany({ orderBy: { sortOrder: 'asc' } })
    } catch (error) {
        console.error('Failed to fetch categories:', error)
        return []
    }
}

export async function createCategory(formData: FormData) {
    const name = formData.get('name') as string
    const nameHindi = formData.get('nameHindi') as string

    if (!name) return { success: false, error: 'Name is required' }

    try {
        await db.videoCategory.create({
            data: { name, nameHindi }
        })
        revalidatePath('/dashboard/categories')
        return { success: true }
    } catch (error) {
        console.error('Failed to create category:', error)
        return { success: false, error: 'Failed to create category' }
    }
}

export async function toggleCategoryStatus(id: number, isActive: boolean) {
    try {
        await db.videoCategory.update({
            where: { id },
            data: { isActive }
        })
        revalidatePath('/dashboard/categories')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to update status' }
    }
}

export async function deleteCategory(id: number) {
    try {
        await db.videoCategory.delete({ where: { id } })
        revalidatePath('/dashboard/categories')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete category' }
    }
}
