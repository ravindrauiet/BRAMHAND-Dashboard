import { fetchFromApi } from '@/lib/api';
import { UserDetails } from '../UserDetails';
import SocialStats from '@/components/dashboard/SocialStats';
import { redirect } from 'next/navigation';

export default async function EditUserPage({ params }: { params: { id: string } }) {
    const data = await fetchFromApi(`/admin/users/${params.id}`);

    if (!data.success || !data.user) redirect('/dashboard/users');
    const user = data.user;

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <UserDetails user={user} />
            <SocialStats userId={user.id} />
        </div>
    );
}
