import { db } from '@/lib/db';
import { UserDetails } from '../UserDetails';
import SocialStats from '@/components/dashboard/SocialStats';
import { redirect } from 'next/navigation';

export default async function EditUserPage({ params }: { params: { id: string } }) {
    const user = await db.user.findUnique({
        where: { id: parseInt(params.id) },
        include: {
            creatorProfile: true,
            preferences: true,
            videos: {
                orderBy: { createdAt: 'desc' },
                take: 20
            },
            videoViews: {
                include: { video: true },
                orderBy: { createdAt: 'desc' },
                take: 20
            },
            videoLikes: {
                include: { video: true },
                orderBy: { createdAt: 'desc' },
                take: 20
            },
            songLikes: {
                include: { song: true },
                orderBy: { createdAt: 'desc' },
                take: 20
            },
            _count: {
                select: { playlists: true, videos: true, songLikes: true, videoLikes: true }
            }
        }
    });

    if (!user) redirect('/dashboard/users');

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <UserDetails user={user} />
            <SocialStats userId={user.id} />
        </div>
    );
}
