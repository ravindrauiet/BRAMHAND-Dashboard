import { Sidebar } from '@/components/Sidebar';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession();

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
