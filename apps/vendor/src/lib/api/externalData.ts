import 'server-only';
import { cookies } from 'next/headers';

export async function getExternalData(): Promise<unknown> {
    const token = (await cookies()).get('pp_token')?.value;

    const externalResponse = await fetch('http://localhost:3333/api/v1', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
    });

    if (!externalResponse.ok) {
        throw new Error(`External API returned HTTP ${externalResponse.status}`);
    }

    return await externalResponse.json();
}
