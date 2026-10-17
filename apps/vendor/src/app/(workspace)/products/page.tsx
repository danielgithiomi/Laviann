import { configured } from '@laviann/shared/server';
import { loadVendor } from '../../../lib/data';
import { Products } from '../../../components/products';
export default async function ProductsPage() {
    const data = await loadVendor();
    return (
        <>
            <div className="page-heading">
                <div>
                    <span className="eyebrow">The raw-meat catalogue</span>
                    <h1>KEEP YOUR COUNTER CURRENT.</h1>
                    <p>Products, prices, cuts, portions and fixed packs — managed in one place.</p>
                </div>
            </div>
            <Products catalog={data.catalog} connected={configured()} />
        </>
    );
}
