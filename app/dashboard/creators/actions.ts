'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function toggleMonetization(creatorId: number, isEnabled: boolean) {
    try {
        await db.creatorProfile.update({
            where: { id: creatorId },
            data: { isMonetizationEnabled: isEnabled },
        })
        revalidatePath('/dashboard/creators')
        return { success: true }
    } catch (error) {
        console.error('Failed to toggle monetization:', error)
        return { success: false, error: 'Failed to update monetization status' }
    }
}

export async function getCreators() {
    try {
        const creators = await db.creatorProfile.findMany({
            include: {
                user: true,
            },
            orderBy: { createdAt: 'desc' },
        })
        return creators
    } catch (error) {
        console.error('Failed to fetch creators:', error)
        return []
    }
}
