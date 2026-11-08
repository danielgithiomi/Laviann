import { NextResponse } from 'next/server';
import { AuthGuard } from '@lib/api/authGuard';
import { getExternalData } from '@lib/api/externalData';

async function fetchExternalData(): Promise<NextResponse> {
    const data = await getExternalData();
    return NextResponse.json(data);
}

export const GET = AuthGuard(fetchExternalData);
