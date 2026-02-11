import { PublicNavbar } from '@/components/site/PublicNavbar';
import { PublicFooter } from '@/components/site/PublicFooter';

import { MusicPlayerProvider } from '@/components/site/providers/MusicPlayerContext';
import { GlobalMusicPlayer } from '@/components/site/GlobalMusicPlayer';

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MusicPlayerProvider>
            <div className="flex flex-col min-h-screen relative pb-20">
                <PublicNavbar />
                <main className="flex-grow">
                    {children}
                </main>
                <PublicFooter />
                <GlobalMusicPlayer />
            </div>
        </MusicPlayerProvider>
    );
}
