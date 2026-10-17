import Link from 'next/link';
import { loadVendor } from '../../../lib/data';
import { Orders } from '../../../components/orders';
export default async function OrdersPage() {
    const data = await loadVendor();
    return (
        <>
            <div className="page-heading">
                <div>
                    <span className="eyebrow">Every request, one workflow</span>
                    <h1>YOUR ORDER COUNTER.</h1>
                    <p>Review requests, issue quotations and keep preparation moving.</p>
                </div>
                <Link href="/orders/new" className="btn btn-primary">
                    ＋ Manual order
                </Link>
            </div>
            <Orders orders={data.orders} catalog={data.catalog} />
        </>
    );
}
