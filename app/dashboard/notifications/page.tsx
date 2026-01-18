import { getRecentNotifications } from './actions';
import { NotificationComposer } from './NotificationComposer';

export default async function NotificationsPage() {
    const notifications = await getRecentNotifications();

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-10 text-center max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">System Broadcast</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400">
                    Send push notifications to your mobile app users. Announcements will appear instantly on their devices.
                </p>
            </div>

            <NotificationComposer initialHistory={notifications} />
        </div>
    );
}
