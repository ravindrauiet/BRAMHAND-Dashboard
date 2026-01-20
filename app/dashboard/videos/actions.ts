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
                // Content-Type omitted to allow boundary generation
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
        // Next.js redirects throw errors, so we must rethrow them
        if (e.message === 'NEXT_REDIRECT') throw e;
        // Actually redirect() throws a special error digest, usually we shouldn't catch it or should rethrow
        // But for other errors:
        console.error('Create video error:', e);
        redirect('/dashboard/videos?error=Creation_Failed');
    }

    redirect('/dashboard/videos');
}

export async function updateVideo(id: number, formData: FormData) {
    // For now, updates might still use JSON or we need to check if backend supports PUT with files
    // Assuming update is just metadata for now, or if files are supported, we'd need a PUT/PATCH route with upload middleware
    // Since we only modified POST / for uploads, we'll assume this is strictly for metadata or needs further backend work for file replacement

    const session = await getServerSession(authOptions);
    // @ts-ignore
    const token = session?.accessToken;

    const data: any = {};
    formData.forEach((value, key) => data[key] = value);

    try {
        const res = await fetch(`${API_URL}/admin/videos/${id}`, {
            method: 'PATCH', // or PUT
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
