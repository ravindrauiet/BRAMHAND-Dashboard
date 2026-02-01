import { fetchFromApi } from '@/lib/api'
import { revalidatePath } from 'next/cache'

export async function sendNotification(formData: FormData) {
    const title = formData.get('title') as string
    const message = formData.get('message') as string

    try {
        await fetchFromApi('/notifications/broadcast', {
            method: 'POST',
            body: JSON.stringify({ title, message })
        });

        revalidatePath('/dashboard/notifications')
        return { success: true }
    } catch (error) {
        console.error('Failed to send notification:', error)
        return { success: false, error: 'Failed to send notification' }
    }
}

export async function getRecentNotifications() {
    try {
        const response = await fetchFromApi('/notifications/system');
        return response.notifications || []
    } catch (error) {
        return []
    }
}
