import { loadCatalog } from '@laviann/shared/server';
import { Checkout } from '../../components/checkout';
export const dynamic = 'force-dynamic';
export default async function CheckoutPage() {
    return (
        <>
            <div className="page-heading">
                <div>
                    <span className="eyebrow">02 / Delivery & contact</span>
                    <h1>LET’S PLAN YOUR DELIVERY.</h1>
                    <p>A few details, then you can review your request.</p>
                </div>
            </div>
            <Checkout catalog={await loadCatalog()} />
        </>
    );
}
