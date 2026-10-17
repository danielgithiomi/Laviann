import { requestSchema } from '@laviann/shared/domain';
import { asJson, body, dbError, digest, endpoint, json, limit, serviceClient, tokenFor } from '@laviann/shared/server';
export async function POST(req: Request) {
    return endpoint(async () => {
        const input = await body(req, requestSchema);
        await limit(req, 'request', 15);
        const token = tokenFor('status', input.idempotency_key);
        const { data, error } = await serviceClient().rpc('create_request', {
            p: asJson(input),
            p_status_digest: digest(token),
            p_origin: 'website',
        });
        dbError(error);
        return json({ result: data, token });
    });
}
