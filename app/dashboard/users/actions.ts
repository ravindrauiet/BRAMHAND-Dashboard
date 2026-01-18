'use server';

import { fetchFromApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteUser(id: number) {
    try {
        await fetchFromApi(`/admin/users/${id}`, { method: 'DELETE' });
        revalidatePath('/dashboard/users');
    } catch (e) {
        console.error("Delete failed", e);
    }
}

export async function toggleUserCreatorStatus(id: number, isCreator: boolean) {
    try {
        await fetchFromApi(`/admin/users/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ isCreator }),
        });
        revalidatePath('/dashboard/users');
    } catch (e) {
        console.error("Toggle Creator failed", e);
    }
}

export async function toggleUserVerifiedStatus(id: number, isVerified: boolean) {
    try {
        await fetchFromApi(`/admin/users/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ isVerified }),
        });
        revalidatePath('/dashboard/users');
    } catch (e) {
        console.error("Toggle Verified failed", e);
    }
}

export async function updateUser(id: number, formData: FormData) {
    // Full User Update not fully implemented in Backend (need PUT endpoint).
    // adminController has updateUserStatus only. 
    // We will redirect for now or log warning.
    console.warn("Update User Full Profile not implemented in backend");

    // Stub behavior
    redirect(`/dashboard/users/${id}`);
}
