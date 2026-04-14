'use server';

import { fetchFromApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function sendPushNotification(payload: {
    user_id?: number;
    title: string;
    body: string;
}) {
    try {
        const result = await fetchFromApi('/admin/notifications/push', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        revalidatePath('/dashboard/notifications');
        return { success: true, message: result.message };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to send push notification' };
    }
}

export async function sendEmailNotification(payload: {
    user_id?: number;
    subject: string;
    message: string;
}) {
    try {
        const result = await fetchFromApi('/admin/notifications/email', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        revalidatePath('/dashboard/notifications');
        return { success: true, message: result.message };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to send email' };
    }
}

export async function getAnalytics() {
    try {
        const data = await fetchFromApi('/admin/notifications/analytics');
        return data;
    } catch {
        return { summary: null, history: [], auto_stats: [] };
    }
}

export async function getAllUsers() {
    try {
        const data = await fetchFromApi('/admin/users');
        return data.users || [];
    } catch {
        return [];
    }
}
