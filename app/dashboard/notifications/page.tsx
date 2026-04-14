import { getAnalytics, getAllUsers } from './actions';
import { NotificationCenter } from './NotificationComposer';

export default async function NotificationsPage() {
    const [analytics, users] = await Promise.all([getAnalytics(), getAllUsers()]);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Notification Center</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Send push notifications & emails to users. Track delivery and engagement.
                </p>
            </div>
            <NotificationCenter analytics={analytics} users={users} />
        </div>
    );
}
