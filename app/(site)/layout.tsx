import { PublicNavbar } from '@/components/site/PublicNavbar';
import { PublicFooter } from '@/components/site/PublicFooter';

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <PublicNavbar />
            <main className="flex-grow">
                {children}
            </main>
            <PublicFooter />
        </div>
    );
}
