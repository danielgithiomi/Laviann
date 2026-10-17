import { configured } from '@laviann/shared/server';
import { loadVendor } from '../../../../lib/data';
import { PaymentSettings } from '../../../../components/settings';
export default async function PaymentPage() {
    const data = await loadVendor();
    return (
        <>
            <div className="page-heading">
                <div>
                    <span className="eyebrow">Human-verified payments</span>
                    <h1>MAKE PAYMENT EXPECTATIONS CLEAR.</h1>
                    <p>Enable preferences and write the instructions customers receive.</p>
                </div>
            </div>
            <PaymentSettings data={data} connected={configured()} />
        </>
    );
}
