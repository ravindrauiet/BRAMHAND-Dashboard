'use server';

import { fetchFromApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function getCreators() {
    const data = await fetchFromApi('/admin/creators');
    if (!data.success) return [];

    return data.creators.map((c: any) => ({
        id: c.id,
        bio: c.bio,
        totalEarnings: c.total_earnings || 0,
        isMonetizationEnabled: !!c.is_monetization_enabled,
        user: {
            fullName: c.full_name || 'Unknown',
            email: c.email,
            profileImage: c.profile_image,
            isVerified: !!c.is_verified
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
