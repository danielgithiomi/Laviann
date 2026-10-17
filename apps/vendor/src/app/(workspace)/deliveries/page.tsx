import { configured } from '@laviann/shared/server';
import { loadVendor } from '../../../lib/data';
import { Deliveries } from '../../../components/deliveries';
export default async function DeliveriesPage() {
    const data = await loadVendor();
    return (
        <>
            <div className="page-heading">
                <div>
                    <span className="eyebrow">Ready for the regional route</span>
                    <h1>PLAN THE DAY’S DELIVERIES.</h1>
                    <p>Confirmed orders grouped by agreed delivery date and region.</p>
                </div>
            </div>
            <Deliveries data={data} connected={configured()} />
        </>
    );
}
