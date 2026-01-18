'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteUser(id: number) {
    // In a real app, you might soft delete or just ban
    // For now, allow delete but it cascades so be careful
    await db.user.delete({ where: { id } });
    revalidatePath('/dashboard/users');
}

export async function toggleUserCreatorStatus(id: number, isCreator: boolean) {
    await db.user.update({ where: { id }, data: { isCreator } });
    revalidatePath('/dashboard/users');
}

export async function toggleUserVerifiedStatus(id: number, isVerified: boolean) {
    await db.user.update({ where: { id }, data: { isVerified } });
    revalidatePath('/dashboard/users');
}

export async function updateUser(id: number, formData: FormData) {
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const mobileNumber = formData.get('mobileNumber') as string;
    const isCreator = formData.get('isCreator') === 'on';
    const isVerified = formData.get('isVerified') === 'on';

    await db.user.update({
        where: { id },
        data: {
            fullName,
            email,
            mobileNumber,
            isCreator,
            isVerified,
        },
    });

    revalidatePath('/dashboard/users');
    redirect('/dashboard/users');
}
