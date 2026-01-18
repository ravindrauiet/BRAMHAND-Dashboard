'use client';

import { useState, useEffect } from 'react';
import { getSocialStats, getFollowers, getFollowing } from '@/app/actions/social';

interface User {
    id: number;
    fullName: string;
    profileImage: string | null;
}

export default function SocialStats({ userId }: { userId: number }) {
    const [stats, setStats] = useState({ followersCount: 0, followingCount: 0 });
    const [view, setView] = useState<'NONE' | 'FOLLOWERS' | 'FOLLOWING'>('NONE');
    const [list, setList] = useState<User[]>([]);

    useEffect(() => {
        loadStats();
    }, [userId]);

    async function loadStats() {
        const res = await getSocialStats(userId);
        if (res.followersCount !== undefined) {
            setStats({ followersCount: res.followersCount, followingCount: res.followingCount });
        }
    }

    async function showFollowers() {
        setView('FOLLOWERS');
        const res = await getFollowers(userId);
        if (res.followers) setList(res.followers);
    }

    async function showFollowing() {
        setView('FOLLOWING');
        const res = await getFollowing(userId);
        if (res.following) setList(res.following);
    }

    return (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Social Graph</h3>
            <div className="flex gap-8 mb-4">
                <button onClick={showFollowers} className="text-center hover:bg-gray-50 p-2 rounded">
                    <div className="text-2xl font-bold text-blue-600">{stats.followersCount}</div>
                    <div className="text-sm text-gray-500">Followers</div>
                </button>
                <button onClick={showFollowing} className="text-center hover:bg-gray-50 p-2 rounded">
                    <div className="text-2xl font-bold text-purple-600">{stats.followingCount}</div>
                    <div className="text-sm text-gray-500">Following</div>
                </button>
            </div>

            {view !== 'NONE' && (
                <div className="mt-4 border-t pt-4">
                    <h4 className="font-medium mb-3">{view === 'FOLLOWERS' ? 'Followers' : 'Following'}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {list.map(u => (
                            <div key={u.id} className="flex items-center gap-2 p-2 border rounded">
                                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                    {u.profileImage ? (
                                        <img src={u.profileImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs">{u.fullName[0]}</div>
                                    )}
                                </div>
                                <span className="text-sm truncate">{u.fullName}</span>
                            </div>
                        ))}
                        {list.length === 0 && <p className="text-gray-500 text-sm">No users found.</p>}
                    </div>
                </div>
            )}
        </div>
    );
}
