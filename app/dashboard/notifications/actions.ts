'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function sendNotification(formData: FormData) {
    const title = formData.get('title') as string
    const message = formData.get('message') as string
    // In a real app, you might have a 'target' selector (All Users, Creators, etc.)
    // For now, let's assume this creates a notification for *all* users (conceptually) or just logs it
    // IMPORTANT: Creating a row for every user in the DB is heavy. Usually you'd have a 'Broadcast' table 
    // or a specialized notification service. 
    // For this dashboard demo, we will creating a single 'System' notification associated with the first admin user 
    // or just creating one sample entry to show it works, as mass-inserting 100k rows is bad practice here.

    // BETTER APPROACH for this demo: Create a 'GLobal Notification' if schema supported it. 
    // Since schema has `userId` on Notification, we will just create it for a few dummy users or the first user found 
    // to demonstrate the functionality without flooding the DB.

    try {
        const users = await db.user.findMany({ take: 5 }) // target first 5 users for demo

        await db.$transaction(
            users.map(user =>
                db.notification.create({
                    data: {
                        userId: user.id,
                        title,
                        message,
                        type: 'SYSTEM'
                    }
                })
            )
        )

        revalidatePath('/dashboard/notifications')
        return { success: true }
    } catch (error) {
        console.error('Failed to send notification:', error)
        return { success: false, error: 'Failed to send notification' }
    }
}

export async function getRecentNotifications() {
    // Fetch distinct recent notifications (grouped by title/message to avoid duplicates in list)
    // Prisma distinct is useful here
    try {
        const notifications = await db.notification.findMany({
            where: { type: 'SYSTEM' },
            orderBy: { createdAt: 'desc' },
            distinct: ['title', 'message'],
            take: 20
        })
        return notifications
    } catch (error) {
        return []
    }
}
