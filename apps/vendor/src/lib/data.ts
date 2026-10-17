import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { vendorDataSchema } from '@laviann/shared/domain';
import { demoVendorData } from '@laviann/shared/demo';
import { ApiError, configured, dbError, vendorClient } from '@laviann/shared/server';
export const loadVendor = cache(async () => {
    if (!configured()) return demoVendorData();
    try {
        const client = await vendorClient();
        const { data, error } = await client.rpc('vendor_data');
        dbError(error);
        return vendorDataSchema.parse(data);
    } catch (error) {
        if (error instanceof ApiError && [401, 403].includes(error.status)) redirect('/login');
        throw error;
    }
});
