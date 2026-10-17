import { endpoint, json, loadCatalog } from '@laviann/shared/server';
export const dynamic = 'force-dynamic';
export async function GET() {
    return endpoint(async () => json(await loadCatalog()));
}
