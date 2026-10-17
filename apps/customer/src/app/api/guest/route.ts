import { z } from 'zod';
import { body, dbError, endpoint, json, limit, serviceClient } from '@laviann/shared/server';
const schema = z.object({
    token: z.string().regex(/^[a-f0-9]{64}$/),
    action: z.enum(['view', 'approve', 'report']),
    reference: z.string().trim().max(200).default(''),
});
export async function POST(req: Request) {
    return endpoint(async () => {
        const input = await body(req, schema);
        await limit(req, `guest-${input.action}`, 100);
        const client = serviceClient();
        const result =
            input.action === 'approve'
                ? await client.rpc('approve_quote', { p_token: input.token })
                : input.action === 'report'
                  ? await client.rpc('report_payment', { p_token: input.token, p_reference: input.reference })
                  : await client.rpc('guest_order', { p_token: input.token });
        dbError(result.error);
        return json(result.data);
    });
}
