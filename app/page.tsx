import { getLandingPageData } from './actions';
import { LandingView } from '../components/site/LandingView';
import { PublicNavbar } from '../components/site/PublicNavbar';
import { PublicFooter } from '../components/site/PublicFooter';

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
    const data = await getLandingPageData();

    return (
        <main className="min-h-screen bg-white dark:bg-black selection:bg-blue-500/30">
            <PublicNavbar />
            <LandingView
                heroVideos={data.heroVideos}
                sections={data.sections}
                continueWatching={data.continueWatching}
            />
            <PublicFooter />
        </main>
    );
}
