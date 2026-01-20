'use server';

import { fetchFromApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function getCreators() {
    const data = await fetchFromApi('/admin/creators');
    if (!data.success) return [];

    return data.creators.map((c: any) => ({
        id: c.id,
        userId: c.userId, // ← ADD THIS
        popularName: c.popularName || 'Unknown',
        bankName: c.bankName,
        accountNumber: c.accountNumber,
        panCard: c.panCard,
        totalEarnings: c.totalEarnings,
        monetizationPercentage: c.monetizationPercentage,
        isMonetizationEnabled: !!c.isMonetizationEnabled,
        user: {
            fullName: c.user?.fullName || c.fullName || 'Unknown',
            email: c.user?.email || c.email,
            profileImage: c.user?.profileImage || c.profileImage,
            isVerified: !!(c.user?.isVerified || c.isVerified)
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
