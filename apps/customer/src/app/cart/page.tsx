import { loadCatalog } from '@laviann/shared/server';
import { Cart } from '../../components/cart';
export const dynamic = 'force-dynamic';
export default async function CartPage() {
    return (
        <>
            <div className="page-heading">
                <div>
                    <span className="eyebrow">01 / Your selection</span>
                    <h1>A LITTLE SOMETHING GOOD.</h1>
                    <p>Check your cuts, weights and portions before choosing delivery.</p>
                </div>
            </div>
            <Cart catalog={await loadCatalog()} />
        </>
    );
}
