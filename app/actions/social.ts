'use server';

import { fetchFromApi, fetchPublicApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function getSocialStats(userId: number) {
    try {
        const [followersRes, followingRes] = await Promise.all([
            fetchPublicApi(`/user/${userId}/followers`),
            fetchPublicApi(`/user/${userId}/following`)
        ]);

        return {
            followersCount: followersRes.followers?.length || 0,
            followingCount: followingRes.following?.length || 0
        };
    } catch (error) {
        return { error: 'Failed' };
    }
}

export async function getFollowers(userId: number) {
    try {
        const response = await fetchPublicApi(`/user/${userId}/followers`);
        return { followers: response.followers || [] };
    } catch (error) {
        return { error: 'Failed' };
    }
}

export async function getFollowing(userId: number) {
    try {
        const response = await fetchPublicApi(`/user/${userId}/following`);
        return { following: response.following || [] };
    } catch (error) {
        return { error: 'Failed' };
    }
}
