import { requestSchema } from '@laviann/shared/domain';
import { asJson, body, dbError, endpoint, json, limit, serviceClient } from '@laviann/shared/server';
export async function POST(req: Request) {
    return endpoint(async () => {
        const input = await body(req, requestSchema);
        await limit(req, 'estimate', 100);
        const { data, error } = await serviceClient().rpc('calculate_estimate', {
            p_items: asJson(input.items),
            p_zone: input.zone_id,
            p_date: input.date,
        });
        dbError(error);
        return json(data);
    });
}
