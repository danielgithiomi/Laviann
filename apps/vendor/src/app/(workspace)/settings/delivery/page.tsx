import { configured } from '@laviann/shared/server';
import { loadVendor } from '../../../../lib/data';
import { DeliverySettings } from '../../../../components/settings';
export default async function DeliveryPage() {
    const data = await loadVendor();
    return (
        <>
            <div className="page-heading">
                <div>
                    <span className="eyebrow">Your regions, your schedule</span>
                    <h1>SET THE DELIVERY RHYTHM.</h1>
                    <p>Fees, weekly days, cutoffs and date exceptions.</p>
                </div>
            </div>
            <DeliverySettings data={data} connected={configured()} />
        </>
    );
}
