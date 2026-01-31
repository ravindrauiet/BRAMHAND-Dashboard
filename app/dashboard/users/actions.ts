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

export async function updateUser(userId: number, formData: FormData) {
    const data = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        mobileNumber: formData.get('mobileNumber'),
        isCreator: formData.get('isCreator') === 'on',
        isVerified: formData.get('isVerified') === 'on'
    };

    await patchToApi(`/admin/users/${userId}/status`, data);
    revalidatePath('/dashboard/users');
    revalidatePath(`/dashboard/users/${userId}`);
}
