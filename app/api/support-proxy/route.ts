import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function getToken() {
    const session = await getServerSession(authOptions) as any;
    return session?.accessToken || null;
}

// GET /api/support-proxy  → GET /admin/support
export async function GET(req: NextRequest) {
    const token = await getToken();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || '';
    const url = `${BACKEND}/admin/support${type ? `?type=${type}` : ''}`;

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}

// PATCH /api/support-proxy?id=X  → PATCH /admin/support/:id
export async function PATCH(req: NextRequest) {
    const token = await getToken();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();

    const res = await fetch(`${BACKEND}/admin/support/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}

// DELETE /api/support-proxy?id=X  → DELETE /admin/support/:id
export async function DELETE(req: NextRequest) {
    const token = await getToken();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const res = await fetch(`${BACKEND}/admin/support/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
