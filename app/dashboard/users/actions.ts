'use server';

import { revalidatePath } from 'next/cache';
import { deleteFromApi, patchToApi } from '@/lib/api';

export async function deleteUser(userId: number) {
    await deleteFromApi(`/admin/users/${userId}`);
    revalidatePath('/dashboard/users');
}

export async function toggleUserCreatorStatus(userId: number, isCreator: boolean) {
    await patchToApi(`/admin/users/${userId}/status`, { isCreator });
    revalidatePath('/dashboard/users');
}

export async function toggleUserVerifiedStatus(userId: number, isVerified: boolean) {
    await patchToApi(`/admin/users/${userId}/status`, { isVerified });
    revalidatePath('/dashboard/users');
}

export async function updateUserRole(userId: number, role: string) {
    await patchToApi(`/admin/users/${userId}/status`, { role });
    revalidatePath('/dashboard/users');
}
