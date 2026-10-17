import { configured } from '@laviann/shared/server';
import { loadVendor } from '../../../lib/data';
import { Inventory } from '../../../components/inventory';
export default async function InventoryPage() {
    const data = await loadVendor();
    return (
        <>
            <div className="page-heading">
                <div>
                    <span className="eyebrow">Physical stock, clearly accounted for</span>
                    <h1>KNOW WHAT’S AVAILABLE.</h1>
                    <p>On-hand stock, reservations and your next replenishment.</p>
                </div>
            </div>
            <Inventory data={data} connected={configured()} />
        </>
    );
}
