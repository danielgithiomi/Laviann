import { z } from 'zod';
import {
    categorySchema,
    dateSchema,
    paymentInputSchema,
    paymentSettingSchema,
    productSchema,
    quoteInputSchema,
    requestSchema,
    stockInputSchema,
    transitionSchema,
    uuid,
    zoneSchema,
} from '@laviann/shared/domain';
import { asJson, body, dbError, digest, endpoint, json, tokenFor, vendorClient } from '@laviann/shared/server';
const envelope = z.object({
    action: z.enum([
        'manual',
        'quote-link',
        'quote',
        'transition',
        'stock',
        'payment',
        'category',
        'product',
        'zone',
        'exception',
        'payment-setting',
        'note',
    ]),
    input: z.unknown(),
});
export async function POST(req: Request) {
    return endpoint(async () => {
        const client = await vendorClient();
        const { action, input } = await body(req, envelope);
        if (action === 'quote-link') {
            const p = z.object({ order_id: uuid }).parse(input);
            const { data, error } = await client
                .from('quotations')
                .select('operation_key, status, expires_at')
                .eq('order_id', p.order_id)
                .order('version', { ascending: false })
                .limit(1)
                .single();
            dbError(error);
            if (!data || data.status !== 'issued' || Date.parse(data.expires_at) <= Date.now())
                return json({ error: 'No current unexpired quotation is available.' }, 409);
            const token = tokenFor('approve', `${p.order_id}:${data.operation_key}`);
            return json({ link: `${process.env.CUSTOMER_ORIGIN || 'http://localhost:3000'}/quotation#${token}` });
        }
        if (action === 'manual') {
            const p = requestSchema.parse(input);
            const token = tokenFor('status', p.idempotency_key);
            const { data, error } = await client.rpc('create_request', {
                p: asJson(p),
                p_status_digest: digest(token),
                p_origin: 'vendor_entered',
            });
            dbError(error);
            return json({ result: data, token });
        }
        if (action === 'quote') {
            const p = quoteInputSchema.parse(input);
            const token = tokenFor('approve', `${p.order_id}:${p.operation_key}`);
            const { data, error } = await client.rpc('issue_quote', { p: asJson(p), p_token_digest: digest(token) });
            dbError(error);
            return json({ result: data, link: `${process.env.CUSTOMER_ORIGIN || 'http://localhost:3000'}/quotation#${token}` });
        }
        const result =
            action === 'transition'
                ? await client.rpc('transition_order', { p: asJson(transitionSchema.parse(input)) })
                : action === 'stock'
                  ? await client.rpc('adjust_stock', { p: asJson(stockInputSchema.parse(input)) })
                  : action === 'payment'
                    ? await client.rpc('record_payment', { p: asJson(paymentInputSchema.parse(input)) })
                    : action === 'category'
                      ? await client.rpc('save_category', { p: asJson(categorySchema.parse(input)) })
                      : action === 'product'
                        ? await client.rpc('save_product', {
                              p: asJson(productSchema.omit({ stock_id: true, available_g: true }).parse(input)),
                          })
                        : action === 'zone'
                          ? await client.rpc('save_zone', { p: asJson(zoneSchema.parse(input)) })
                          : action === 'payment-setting'
                            ? await client.rpc('save_payment_setting', { p: asJson(paymentSettingSchema.parse(input)) })
                            : action === 'exception'
                              ? await client.rpc(
                                    'save_exception',
                                    (() => {
                                        const p = z
                                            .object({ zone_id: uuid, date: dateSchema, offered: z.boolean() })
                                            .parse(input);
                                        return { p_zone: p.zone_id, p_date: p.date, p_offered: p.offered };
                                    })(),
                                )
                              : await client.rpc(
                                    'add_order_note',
                                    (() => {
                                        const p = z
                                            .object({ order_id: uuid, note: z.string().trim().min(3).max(500) })
                                            .parse(input);
                                        return { p_order: p.order_id, p_note: p.note };
                                    })(),
                                );
        dbError(result.error);
        return json({ ok: true, result: result.data });
    });
}
