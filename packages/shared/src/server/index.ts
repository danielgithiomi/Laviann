import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createHash, createHmac } from 'node:crypto';
import { z } from 'zod';
import type { Database, Json } from '../types/database';
import { catalogSchema } from '../domain';
import { demoCatalog } from '../domain/demo';

export function configured(): boolean {
    return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
}
function publicConfig() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error('Backend setup is required. This preview does not save orders.');
    return { url, key };
}
export function serviceClient() {
    const { url } = publicConfig();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) throw new Error('Server configuration is incomplete. Contact the vendor.');
    return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
export async function sessionClient() {
    const { url, key } = publicConfig();
    const jar = await cookies();
    return createServerClient<Database>(url, key, {
        cookies: {
            getAll: () => jar.getAll(),
            setAll: values => {
                try {
                    values.forEach(({ name, value, options }) => jar.set(name, value, options));
                } catch {
                    /* Server component: proxy persists refreshed cookies. */
                }
            },
        },
    });
}
export async function vendorClient() {
    const client = await sessionClient();
    const {
        data: { user },
        error,
    } = await client.auth.getUser();
    if (error || !user) throw new ApiError('Sign in to your vendor account.', 401);
    const { data: allowed } = await client.rpc('is_vendor');
    if (!allowed) throw new ApiError('This account is not the authorized vendor.', 403);
    return client;
}
export async function loadCatalog() {
    if (!configured()) return demoCatalog();
    const { url, key } = publicConfig();
    const { data, error } = await createClient<Database>(url, key).rpc('catalog_data', { p_vendor: false });
    dbError(error);
    return catalogSchema.parse(data);
}
export class ApiError extends Error {
    constructor(
        message: string,
        public status = 400,
    ) {
        super(message);
    }
}
export function dbError(error: { message: string; code: string } | null) {
    if (!error) return;
    if (['P0001', '42501'].includes(error.code)) throw new ApiError(error.message, error.code === '42501' ? 403 : 409);
    // Constraint errors and provider diagnostics must not reveal PII or database internals.
    throw new ApiError('The change could not be saved. Check the values and refresh before retrying.', 400);
}
export function tokenFor(purpose: 'status' | 'approve', key: string): string {
    const secret = process.env.SERVER_TOKEN_SECRET;
    if (!secret || secret.length < 32) throw new ApiError('Secure links are not configured on the server.', 503);
    return createHmac('sha256', secret).update(`${purpose}:${key}`).digest('hex');
}
export function digest(token: string) {
    return createHash('sha256').update(token).digest('hex');
}
export function json(value: unknown, status = 200) {
    return Response.json(value, {
        status,
        headers: { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' },
    });
}
export async function endpoint(work: () => Promise<Response>): Promise<Response> {
    try {
        return await work();
    } catch (error) {
        if (error instanceof z.ZodError)
            return json({ error: error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') }, 400);
        if (error instanceof ApiError) return json({ error: error.message }, error.status);
        return json({ error: 'The service is unavailable. Your action has not been confirmed; retry safely.' }, 503);
    }
}
export async function body<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
    const expected = new URL(process.env.APP_ORIGIN || 'http://localhost:3000').origin;
    if (req.headers.get('origin') !== expected) throw new ApiError('This request must come from the Laviann application.', 403);
    if (!req.headers.get('content-type')?.startsWith('application/json')) throw new ApiError('Send a JSON request.', 415);
    if (Number(req.headers.get('content-length')) > 48000) throw new ApiError('This request is too large.', 413);
    const reader = req.body?.getReader();
    const decoder = new TextDecoder();
    let raw = '';
    let size = 0;
    if (reader) {
        try {
            for (;;) {
                const chunk = await reader.read();
                if (chunk.done) break;
                size += chunk.value.byteLength;
                if (size > 48000) {
                    await reader.cancel();
                    throw new ApiError('This request is too large.', 413);
                }
                raw += decoder.decode(chunk.value, { stream: true });
            }
            raw += decoder.decode();
        } finally {
            reader.releaseLock();
        }
    }
    let value: unknown;
    try {
        value = JSON.parse(raw);
    } catch {
        throw new ApiError('Invalid request data.');
    }
    return schema.parse(value);
}
export async function limit(req: Request, action: string, maximum = 30) {
    // Only enable this header behind a proxy that replaces, rather than appends, it.
    const source =
        process.env.TRUST_PROXY_IP === 'true'
            ? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
            : 'shared-local';
    const bucket = digest(`${action}:${source}`);
    const { data, error } = await serviceClient().rpc('rate_limit', { p_bucket: bucket, p_limit: maximum });
    dbError(error);
    if (!data) throw new ApiError('Too many attempts. Wait ten minutes and try again.', 429);
}
export function asJson(value: unknown): Json {
    return z.json().parse(value);
}
