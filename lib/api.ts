import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetchFromApi(endpoint: string, options: RequestInit = {}) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const token = session?.accessToken;

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

    if (!res.ok) {
        // Handle common errors or throw
        const errorBody = await res.text();
        throw new Error(`API Error ${res.status}: ${errorBody}`);
    }
    return res.json();
}

export async function fetchPublicApi(endpoint: string) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { "Content-Type": "application/json" },
        cache: 'no-store' // Ensure fresh data
    });
    if (!res.ok) {
        console.error(`Public API Error ${res.status} for ${endpoint}`);
        return { success: false };
    }
    return res.json();
}

export async function deleteFromApi(endpoint: string) {
    return fetchFromApi(endpoint, { method: 'DELETE' });
}

export async function patchToApi(endpoint: string, body: any) {
    return fetchFromApi(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(body)
    });
}
