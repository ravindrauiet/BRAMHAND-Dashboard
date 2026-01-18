'use server';

import { fetchFromApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function getCreators() {
    const data = await fetchFromApi('/admin/creators');
    if (!data.success) return [];

    return data.creators.map((c: any) => ({
        id: c.id,
        bio: c.bio,
        totalEarnings: c.totalEarnings,
        isMonetizationEnabled: c.isMonetizationEnabled,
        user: {
            fullName: c.fullName,
            email: c.email,
            profileImage: c.profileImage,
            isVerified: c.isVerified
        }
    }));
}

export async function toggleMonetization(id: number, enabled: boolean) {
    try {
        await fetchFromApi(`/admin/creators/${id}/monetization`, {
            method: 'PATCH',
            body: JSON.stringify({ enabled })
        });
        revalidatePath('/dashboard/creators');
    } catch (e) {
        console.error("Toggle monetization failed", e);
    }
}
