import { configured } from '@laviann/shared/server';
import { loadVendor } from '../../../../lib/data';
import { ManualOrder } from '../../../../components/manual-order';
export default async function ManualPage() {
    const data = await loadVendor();
    return (
        <>
            <div className="page-heading">
                <div>
                    <span className="eyebrow">WhatsApp & phone orders</span>
                    <h1>BRING THE CONVERSATION HERE.</h1>
                    <p>Transcribe the customer’s request, then issue a quotation for approval.</p>
                </div>
            </div>
            <ManualOrder catalog={data.catalog} connected={configured()} />
        </>
    );
}
