'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getSocialStats(userId: number) {
    try {
        const followersCount = await db.follows.count({ where: { followingId: userId } });
        const followingCount = await db.follows.count({ where: { followerId: userId } });
        return { followersCount, followingCount };
    } catch (error) {
        return { error: 'Failed' };
    }
}

export async function getFollowers(userId: number) {
    try {
        const followers = await db.follows.findMany({
            where: { followingId: userId },
            include: { follower: true }
        });
        return { followers: followers.map(f => f.follower) };
    } catch (error) {
        return { error: 'Failed' };
    }
}

export async function getFollowing(userId: number) {
    try {
        const following = await db.follows.findMany({
            where: { followerId: userId },
            include: { following: true }
        });
        return { following: following.map(f => f.following) };
    } catch (error) {
        return { error: 'Failed' };
    }
}
