import { z } from 'zod';
import { body, endpoint, json, sessionClient } from '@laviann/shared/server';
export async function POST(req: Request) {
    return endpoint(async () => {
        await body(req, z.object({}));
        await (await sessionClient()).auth.signOut();
        return json({ ok: true });
    });
}
