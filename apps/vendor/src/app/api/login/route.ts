import { z } from 'zod';
import { ApiError, body, endpoint, json, limit, sessionClient } from '@laviann/shared/server';
export async function POST(req: Request) {
    return endpoint(async () => {
        const input = await body(req, z.object({ email: z.email(), password: z.string().min(8).max(200) }));
        await limit(req, 'login', 15);
        const client = await sessionClient();
        const { error } = await client.auth.signInWithPassword(input);
        if (error)
            throw new ApiError(
                error.code === 'email_provider_disabled'
                    ? 'Vendor sign-in is not configured. Contact the project administrator.'
                    : 'Check your email and password.',
                error.code === 'email_provider_disabled' ? 503 : 401,
            );
        const { data: allowed } = await client.rpc('is_vendor');
        if (!allowed) {
            await client.auth.signOut();
            throw new ApiError('This account is not the authorized vendor.', 403);
        }
        return json({ ok: true });
    });
}
