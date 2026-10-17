import { z } from '../../packages/shared/node_modules/zod';
import { beforeAll, afterAll, describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { createClient, type SupabaseClient } from '../../apps/customer/node_modules/@supabase/supabase-js';
import type { Database } from '../../packages/shared/src/types/database';
import {
    catalogSchema,
    guestOrderSchema,
    type LineInput,
    type OrderRequest,
    type Product,
} from '../../packages/shared/src/domain';
const env = Object.fromEntries(
    readFileSync('.env.test.local', 'utf8')
        .trim()
        .split('\n')
        .map(l => {
            const i = l.indexOf('=');
            return [l.slice(0, i), l.slice(i + 1)];
        }),
);
if (new URL(env.NEXT_PUBLIC_SUPABASE_URL!).hostname !== '127.0.0.1' || !env.TEST_DB_URL?.includes('127.0.0.1:54322/'))
    throw new Error('Integration tests only run against the isolated local Laviann Supabase stack.');
const service = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
});
const anon = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false },
});
const vendor = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false },
});
let outsider: SupabaseClient<Database>;
let outsiderId = '';
let catalog: ReturnType<typeof catalogSchema.parse>;
const token = () => randomBytes(32).toString('hex');
const hash = (s: string) => createHash('sha256').update(s).digest('hex');
function checked<T>(r: { data: T; error: { message: string } | null }): NonNullable<T> {
    if (r.error) throw new Error(r.error.message);
    if (r.data === null) throw new Error('Expected data');
    return r.data as NonNullable<T>;
}
function ok(r: { error: { message: string } | null }) {
    if (r.error) throw new Error(r.error.message);
}
function sql(query: string) {
    const r = Bun.spawnSync(['psql', env.TEST_DB_URL!, '-XAt', '-v', 'ON_ERROR_STOP=1', '-c', query]);
    if (r.exitCode) throw new Error(r.stderr.toString());
    return r.stdout.toString().trim();
}
function line(p: Product, g = 2000): LineInput {
    return {
        product_id: p.id,
        grams: g,
        cut: p.cuts[0]!,
        pack_g: 500,
        note: 'DEMO test instructions',
        mode: 'weight',
        pack_id: '',
        pack_count: 1,
    };
}
function request(items: LineInput[], method: 'cash_on_delivery' | 'mcb_juice' = 'cash_on_delivery'): OrderRequest {
    const north = catalog.zones.find(z => z.name === 'North')!;
    return {
        idempotency_key: randomUUID(),
        items,
        contact: {
            name: 'Demo Test Customer',
            phone: '+230 00000000',
            locality: 'Demo locality',
            address: 'DEMO ADDRESS — not a real delivery',
        },
        zone_id: north.id,
        date: catalog.offers.find(o => o.zone_id === north.id)!.date,
        payment_method: method,
    };
}
async function submit(p: OrderRequest, manual = false) {
    const t = token();
    const result = checked(
        await (manual ? vendor : service).rpc('create_request', {
            p: JSON.parse(JSON.stringify(p)),
            p_status_digest: hash(t),
            p_origin: manual ? 'vendor_entered' : 'website',
        }),
    );
    const parsed = z.object({ id: z.uuid(), reference: z.string(), status: z.string() }).parse(result);
    return { ...parsed, token: t, request: p };
}
async function issue(o: Awaited<ReturnType<typeof submit>>, version = 0, items = o.request.items) {
    const t = token();
    const p = {
        order_id: o.id,
        operation_key: randomUUID(),
        expected_version: version,
        items,
        zone_id: o.request.zone_id,
        date: o.request.date,
        note: 'DEMO reviewed quotation',
        expires_hours: 48,
    };
    const q = checked(await vendor.rpc('issue_quote', { p, p_token_digest: hash(t) }));
    return { token: t, p, result: q };
}
async function stock(id: string) {
    return checked(await vendor.from('inventory_items').select('*').eq('id', id).single());
}
async function isolatedProduct(onHand = 10000) {
    const id = randomUUID();
    const p = {
        ...catalog.products[0]!,
        id,
        slug: `test-${id}`,
        name: 'DEMO test stock',
        cuts: ['as supplied'],
        price_cents: 10000,
    };
    ok(await vendor.rpc('save_product', { p }));
    const c = catalogSchema.parse(checked(await vendor.rpc('catalog_data', { p_vendor: true })));
    const product = c.products.find(p => p.id === id)!;
    checked(
        await vendor.rpc('adjust_stock', {
            p: {
                stock_id: product.stock_id,
                operation_key: randomUUID(),
                delta_g: onHand,
                target_g: 50000,
                threshold_percent: 10,
                reason: 'DEMO integration stock',
            },
        }),
    );
    return { ...product, available_g: onHand };
}
async function view(t: string) {
    return guestOrderSchema.parse(checked(await service.rpc('guest_order', { p_token: t })));
}
beforeAll(async () => {
    const login = await vendor.auth.signInWithPassword({ email: env.TEST_VENDOR_EMAIL!, password: env.TEST_VENDOR_PASSWORD! });
    if (login.error) throw new Error('Run bun scripts/setup-local.ts before integration tests.');
    catalog = catalogSchema.parse(checked(await anon.rpc('catalog_data', { p_vendor: false })));
    const password = randomBytes(20).toString('hex');
    const email = `outsider-${randomUUID()}@example.test`;
    const user = checked(await service.auth.admin.createUser({ email, password, email_confirm: true }));
    outsiderId = user.user!.id;
    outsider = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
        auth: { persistSession: false },
    });
    checked(await outsider.auth.signInWithPassword({ email, password }));
});
afterAll(async () => {
    if (outsiderId) await service.auth.admin.deleteUser(outsiderId);
});

describe('actual Supabase transactions, access rules and the eight PRD scenarios', () => {
    test('public self-registration is disabled while the provisioned owner can sign in', async () => {
        const result = await anon.auth.signUp({
            email: `blocked-${randomUUID()}@example.test`,
            password: randomBytes(20).toString('hex'),
        });
        expect(result.error?.code).toBe('signup_disabled');
    });
    test('A/B/C/D: six-kilo request → quote → duplicate approval → prepare → delivery → manual payment', async () => {
        const products = ['chicken-breast', 'chicken-drumsticks', 'chicken-wings'].map(s =>
            catalog.products.find(p => p.slug === s)!,
        );
        for (const p of products) {
            const s = await stock(p.stock_id);
            const missing = 10000 - (s.on_hand_g - s.reserved_g);
            if (missing > 0)
                checked(
                    await vendor.rpc('adjust_stock', {
                        p: {
                            stock_id: s.id,
                            operation_key: randomUUID(),
                            delta_g: missing,
                            target_g: s.target_g,
                            threshold_percent: s.threshold_percent,
                            reason: 'DEMO repeatable test replenishment',
                        },
                    }),
                );
        }
        const before = await Promise.all(products.map(p => stock(p.stock_id)));
        const req = request(products.map(p => line(p)));
        const o = await submit(req);
        const duplicate = checked(
            await service.rpc('create_request', {
                p: JSON.parse(JSON.stringify(req)),
                p_status_digest: hash(o.token),
                p_origin: 'website',
            }),
        );
        expect(duplicate).toMatchObject({ id: o.id, status: 'pending_review' });
        const pending = await view(o.token);
        expect(pending.estimate.total_cents).toBe(209500);
        expect(pending.estimate.subtotal_cents).toBe(197000);
        expect(pending.estimate.items.reduce((n, l) => n + l.package_count, 0)).toBe(12);
        expect(pending.status).toBe('pending_review');
        for (let i = 0; i < products.length; i++)
            expect((await stock(products[i]!.stock_id)).reserved_g).toBe(before[i]!.reserved_g);
        const q = await issue(o);
        expect((await view(q.token)).can_approve).toBe(true);
        const [a, b] = await Promise.all([
            service.rpc('approve_quote', { p_token: q.token }),
            service.rpc('approve_quote', { p_token: q.token }),
        ]);
        expect(a.error).toBeNull();
        expect(b.error).toBeNull();
        for (let i = 0; i < products.length; i++)
            expect((await stock(products[i]!.stock_id)).reserved_g).toBe(before[i]!.reserved_g + 2000);
        const preparation = { order_id: o.id, status: 'preparing', reason: '' };
        checked(await vendor.rpc('transition_order', { p: preparation }));
        checked(await vendor.rpc('transition_order', { p: preparation }));
        for (let i = 0; i < products.length; i++) {
            const current = await stock(products[i]!.stock_id);
            expect(current.on_hand_g).toBe(before[i]!.on_hand_g - 2000);
            expect(current.reserved_g).toBe(before[i]!.reserved_g);
        }
        for (const status of ['ready_for_delivery', 'out_for_delivery', 'delivered'])
            checked(await vendor.rpc('transition_order', { p: { order_id: o.id, status, reason: '' } }));
        expect((await view(o.token)).payment_status).toBe('unpaid');
        const payment = {
            order_id: o.id,
            operation_key: randomUUID(),
            status: 'paid',
            reference: 'DEMO cash recorded by test vendor',
        };
        checked(await vendor.rpc('record_payment', { p: payment }));
        checked(await vendor.rpc('record_payment', { p: payment }));
        expect((await view(o.token)).payment_status).toBe('paid');
        expect(checked(await vendor.from('payment_records').select('id').eq('order_id', o.id))).toHaveLength(1);
    });
    test('E: manual WhatsApp request uses the same approval and reservation pipeline', async () => {
        const p = await isolatedProduct();
        const o = await submit(request([line(p)]), true);
        expect((await view(o.token)).origin).toBe('vendor_entered');
        const q = await issue(o);
        checked(await service.rpc('approve_quote', { p_token: q.token }));
        expect((await view(o.token)).status).toBe('confirmed');
        expect((await stock(p.stock_id)).reserved_g).toBe(2000);
    });
    test('G: two customers race for the final stock; exactly one succeeds, with no partial reservation', async () => {
        const p = await isolatedProduct(2000);
        const orders = await Promise.all([submit(request([line(p)])), submit(request([line(p)]))]);
        const quotes = await Promise.all(orders.map(o => issue(o)));
        const attempts = await Promise.all(quotes.map(q => service.rpc('approve_quote', { p_token: q.token })));
        expect(attempts.filter(r => r.error === null)).toHaveLength(1);
        expect(attempts.filter(r => r.error !== null)).toHaveLength(1);
        expect((await stock(p.stock_id)).reserved_g).toBe(2000);
        expect(checked(await vendor.from('inventory_reservations').select('*').eq('stock_id', p.stock_id))).toHaveLength(1);
    });
    test('H: v2 revokes v1, preserves immutable original request and rejects stale vendor edits', async () => {
        const p = await isolatedProduct();
        const o = await submit(request([line(p)]));
        const v1 = await issue(o);
        const v2 = await issue(o, 1, [line(p, 1000)]);
        expect((await service.rpc('approve_quote', { p_token: v1.token })).error).not.toBeNull();
        expect((await service.rpc('guest_order', { p_token: v1.token })).error).not.toBeNull();
        const current = await view(v2.token);
        expect(current.quotes[0]!.version).toBe(2);
        expect(current.quotes[0]!.items[0]!.grams).toBe(1000);
        expect(current.estimate.items[0]!.grams).toBe(2000);
        expect((await vendor.rpc('issue_quote', { p: v1.p, p_token_digest: hash(v1.token) })).error).not.toBeNull();
        checked(await service.rpc('approve_quote', { p_token: v2.token }));
        expect((await stock(p.stock_id)).reserved_g).toBe(1000);
    });
    test('preparation/cancellation are idempotent; consumed meat is never restored', async () => {
        const p = await isolatedProduct();
        const o = await submit(request([line(p)]));
        const q = await issue(o);
        checked(await service.rpc('approve_quote', { p_token: q.token }));
        const cancel = { order_id: o.id, status: 'cancelled', reason: 'DEMO customer cancellation' };
        checked(await vendor.rpc('transition_order', { p: cancel }));
        checked(await vendor.rpc('transition_order', { p: cancel }));
        expect((await stock(p.stock_id)).reserved_g).toBe(0);
        expect((await stock(p.stock_id)).on_hand_g).toBe(10000);
        const second = await submit(request([line(p)]));
        const q2 = await issue(second);
        checked(await service.rpc('approve_quote', { p_token: q2.token }));
        checked(await vendor.rpc('transition_order', { p: { order_id: second.id, status: 'preparing', reason: '' } }));
        checked(await vendor.rpc('transition_order', { p: { ...cancel, order_id: second.id } }));
        expect((await stock(p.stock_id)).on_hand_g).toBe(8000);
        expect((await stock(p.stock_id)).reserved_g).toBe(0);
    });
    test('duplicate lines sharing a source reserve their aggregated weight once', async () => {
        const p = await isolatedProduct(5000);
        const o = await submit(request([line(p, 1000), line(p, 2000)]));
        const q = await issue(o);
        checked(await service.rpc('approve_quote', { p_token: q.token }));
        expect((await stock(p.stock_id)).reserved_g).toBe(3000);
        const reservations = checked(await vendor.from('inventory_reservations').select('*').eq('order_id', o.id));
        expect(reservations).toHaveLength(1);
        expect(reservations[0]!.grams).toBe(3000);
    });
    test('unauthenticated and authenticated non-owner users cannot read private data or mutate operations', async () => {
        for (const table of ['orders', 'guest_tokens', 'payment_records', 'inventory_movements', 'vendor_admins'] as const) {
            const a = await anon.from(table).select('*');
            expect(a.error !== null || a.data?.length === 0).toBe(true);
            const b = await outsider.from(table).select('*');
            expect(b.error !== null || b.data?.length === 0).toBe(true);
        }
        expect((await outsider.rpc('vendor_data')).error).not.toBeNull();
        expect((await anon.rpc('guest_order', { p_token: token() })).error).not.toBeNull();
        expect((await outsider.rpc('save_zone', { p: z.json().parse(catalog.zones[0]) })).error).not.toBeNull();
        expect((await outsider.rpc('adjust_stock', { p: {} })).error).not.toBeNull();
        expect((await outsider.rpc('record_payment', { p: {} })).error).not.toBeNull();
        expect((await outsider.rpc('issue_quote', { p: {}, p_token_digest: hash(token()) })).error).not.toBeNull();
    });
    test('capabilities are unique, purpose-scoped, expiring and contain no public customer details', async () => {
        const p = await isolatedProduct();
        const o = await submit(request([line(p)]));
        const other = await submit(request([line(p)]));
        expect(o.token).not.toBe(other.token);
        expect((await service.rpc('approve_quote', { p_token: o.token })).error).not.toBeNull();
        const q = await issue(o);
        const guest = await view(q.token);
        expect(guest.id).toBe(o.id);
        expect(guest.id).not.toBe(other.id);
        expect('request' in guest).toBe(false);
        expect(JSON.stringify(guest)).not.toContain('+230 00000000');
        sql(`update public.guest_tokens set expires_at=now()-interval '1 second' where order_id='${o.id}';`);
        expect((await service.rpc('approve_quote', { p_token: q.token })).error).not.toBeNull();
        expect((await service.rpc('guest_order', { p_token: o.token })).error).not.toBeNull();
    });
    test('trusted prices ignore tampered line prices; request keys reject changed payloads', async () => {
        const p = await isolatedProduct();
        const req = request([line(p)]);
        const t = token();
        const altered = { ...req, total_cents: 1, fee_cents: 1, items: [{ ...req.items[0], unit_cents: 1, line_cents: 1 }] };
        const result = checked(
            await service.rpc('create_request', {
                p: JSON.parse(JSON.stringify(altered)),
                p_status_digest: hash(t),
                p_origin: 'website',
            }),
        );
        expect(result).toMatchObject({ status: 'pending_review' });
        expect((await view(t)).estimate.total_cents).toBe(32500);
        expect(
            (
                await service.rpc('create_request', {
                    p: JSON.parse(JSON.stringify({ ...altered, contact: { ...req.contact, name: 'Different customer' } })),
                    p_status_digest: hash(t),
                    p_origin: 'website',
                })
            ).error,
        ).not.toBeNull();
    });
    test('cut/portion/increment validation, category/product creation and inactive products', async () => {
        const p = await isolatedProduct();
        const bad = [
            { ...line(p), cut: 'invented' },
            { ...line(p), grams: 501 },
            { ...line(p), grams: 2500, pack_g: 1000 },
        ];
        for (const l of bad) {
            const req = request([l]);
            const result = await service.rpc('calculate_estimate', { p_items: [l], p_zone: req.zone_id, p_date: req.date });
            expect(result.error?.message).toMatch(/Invalid weight|divide evenly/);
        }
        const c = { id: randomUUID(), name: 'DEMO raw category', slug: `demo-${randomUUID()}`, active: true };
        ok(await vendor.rpc('save_category', { p: c }));
        ok(await vendor.rpc('save_product', { p: { ...p, category_id: c.id, active: false } }));
        const req = request([line(p)]);
        expect(
            (
                await service.rpc('create_request', {
                    p: JSON.parse(JSON.stringify(req)),
                    p_status_digest: hash(token()),
                    p_origin: 'website',
                })
            ).error,
        ).not.toBeNull();
    });
    test('delivery exceptions are enforced again at approval and accepted fees never change', async () => {
        const p = await isolatedProduct();
        const o = await submit(request([line(p)]));
        const q = await issue(o);
        ok(await vendor.rpc('save_exception', { p_zone: o.request.zone_id, p_date: o.request.date, p_offered: false }));
        expect((await service.rpc('approve_quote', { p_token: q.token })).error).not.toBeNull();
        expect((await stock(p.stock_id)).reserved_g).toBe(0);
        ok(await vendor.rpc('save_exception', { p_zone: o.request.zone_id, p_date: o.request.date, p_offered: true }));
        checked(await service.rpc('approve_quote', { p_token: q.token }));
        const zone = catalog.zones.find(z => z.id === o.request.zone_id)!;
        ok(await vendor.rpc('save_zone', { p: { ...zone, fee_cents: 99000 } }));
        expect((await view(o.token)).quotes[0]!.fee_cents).toBe(12500);
        ok(await vendor.rpc('save_zone', { p: zone }));
    });
    test('F: low stock settings, adjustment retry, and reservation-safe negative adjustment', async () => {
        const p = await isolatedProduct(5000);
        const s = await stock(p.stock_id);
        expect((s.on_hand_g - s.reserved_g) * 100 <= s.target_g * s.threshold_percent).toBe(true);
        const change = {
            stock_id: s.id,
            operation_key: randomUUID(),
            delta_g: 1000,
            target_g: 50000,
            threshold_percent: 10,
            reason: 'DEMO replenishment',
        };
        checked(await vendor.rpc('adjust_stock', { p: change }));
        checked(await vendor.rpc('adjust_stock', { p: change }));
        expect((await stock(s.id)).on_hand_g).toBe(6000);
        expect((await vendor.rpc('adjust_stock', { p: { ...change, delta_g: 2000 } })).error).not.toBeNull();
        const o = await submit(request([line(p)]));
        const q = await issue(o);
        checked(await service.rpc('approve_quote', { p_token: q.token }));
        expect(
            (await vendor.rpc('adjust_stock', { p: { ...change, operation_key: randomUUID(), delta_g: -5000 } })).error,
        ).not.toBeNull();
        expect((await stock(s.id)).on_hand_g).toBe(6000);
    });
    test('customer transfer report is never paid; only owner can verify', async () => {
        const p = await isolatedProduct();
        const o = await submit(request([line(p)], 'mcb_juice'));
        const q = await issue(o);
        checked(await service.rpc('approve_quote', { p_token: q.token }));
        checked(await service.rpc('report_payment', { p_token: o.token, p_reference: 'DEMO reported transfer' }));
        expect((await view(o.token)).payment_status).toBe('payment_reported');
        expect(
            (
                await outsider.rpc('record_payment', {
                    p: { order_id: o.id, operation_key: randomUUID(), status: 'paid', reference: 'invalid' },
                })
            ).error,
        ).not.toBeNull();
        expect((await view(o.token)).payment_status).toBe('payment_reported');
    });
    test('database rate buckets enforce the shared limit', async () => {
        const bucket = hash(token());
        expect(checked(await service.rpc('rate_limit', { p_bucket: bucket, p_limit: 1 }))).toBe(true);
        expect(checked(await service.rpc('rate_limit', { p_bucket: bucket, p_limit: 1 }))).toBe(false);
    });
    test('a shortage in a later stock row rolls back all earlier allocations', async () => {
        const products = await Promise.all([isolatedProduct(3000), isolatedProduct(3000)]);
        products.sort((a, b) => a.stock_id.localeCompare(b.stock_id));
        const o = await submit(request(products.map(p => line(p, 1000))));
        const q = await issue(o);
        const last = products[1]!;
        checked(
            await vendor.rpc('adjust_stock', {
                p: {
                    stock_id: last.stock_id,
                    operation_key: randomUUID(),
                    delta_g: -3000,
                    target_g: 50000,
                    threshold_percent: 10,
                    reason: 'DEMO stock loss after quote',
                },
            }),
        );
        expect((await service.rpc('approve_quote', { p_token: q.token })).error?.message).toContain('Stock changed');
        for (const p of products) expect((await stock(p.stock_id)).reserved_g).toBe(0);
        expect(checked(await vendor.from('inventory_reservations').select('order_id').eq('order_id', o.id))).toHaveLength(0);
        expect((await view(o.token)).status).toBe('awaiting_customer_confirmation');
    });
    test('price, product availability and payment-instruction edits preserve the approved snapshot', async () => {
        const p = await isolatedProduct();
        const o = await submit(request([line(p)], 'mcb_juice'));
        const q = await issue(o);
        checked(await service.rpc('approve_quote', { p_token: q.token }));
        const before = await view(o.token);
        const setting = catalog.payments.find(p => p.method === 'mcb_juice')!;
        ok(await vendor.rpc('save_product', { p: { ...p, price_cents: 99999, active: false } }));
        ok(await vendor.rpc('save_payment_setting', { p: { ...setting, instructions: 'DEMO new instructions' } }));
        const after = await view(o.token);
        expect(after.quotes[0]!.items).toEqual(before.quotes[0]!.items);
        expect(after.payment_instructions).toBe(before.payment_instructions);
        expect((await outsider.rpc('save_payment_setting', { p: setting })).error).not.toBeNull();
        ok(await vendor.rpc('save_payment_setting', { p: setting }));
    });
});
