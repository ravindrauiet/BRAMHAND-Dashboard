'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function createVideo(formData: FormData) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const token = session?.accessToken;

    try {
        const res = await fetch(`${API_URL}/admin/videos`, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: formData,
        });

        if (!res.ok) {
            const text = await res.text();
            console.error('Create video failed:', text);
            redirect(`/dashboard/videos?error=${encodeURIComponent(text)}`);
        }

        revalidatePath('/dashboard/videos');
    } catch (e: any) {
        if (e.message === 'NEXT_REDIRECT') throw e;
        console.error('Create video error:', e);
        redirect('/dashboard/videos?error=Creation_Failed');
    }

    redirect('/dashboard/videos');
}

export async function updateVideo(id: number, formData: FormData) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const token = session?.accessToken;

    const data: any = {};
    formData.forEach((value, key) => data[key] = value);

    try {
        const res = await fetch(`${API_URL}/admin/videos/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            redirect('/dashboard/videos?error=Update_Failed');
        }

        revalidatePath('/dashboard/videos');
    } catch (e: any) {
        if (e.message === 'NEXT_REDIRECT') throw e;
        redirect('/dashboard/videos?error=Update_Failed');
    }

    redirect('/dashboard/videos');
}

export async function deleteVideo(id: number) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const token = session?.accessToken;

    try {
        const res = await fetch(`${API_URL}/admin/videos/${id}`, {
            method: 'DELETE',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        });

        if (!res.ok) {
            console.error('Delete failed');
            return;
        }

        revalidatePath('/dashboard/videos');
    } catch (e) {
        console.error('Delete error', e);
    }
}

export async function toggleVideoStatus(id: number, isActive: boolean) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const token = session?.accessToken;

    try {
        const res = await fetch(`${API_URL}/admin/videos/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ isActive })
        });

        if (!res.ok) {
            console.error('Status toggle failed');
            return;
        }

        revalidatePath('/dashboard/videos');
    } catch (e) {
        console.error('Status toggle error', e);
    }
}
