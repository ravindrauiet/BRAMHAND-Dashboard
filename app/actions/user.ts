'use server';

import { fetchFromApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function updatePreferences(data: any) {
    try {
        await fetchFromApi('/user/preferences', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        revalidatePath('/u/dashboard');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update preferences' };
    }
}
