import { notFound } from 'next/navigation';
import Link from 'next/link';
import { configured } from '@laviann/shared/server';
import { loadVendor } from '../../../../lib/data';
import { OrderDetail } from '../../../../components/order-detail';
export default async function Detail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await loadVendor();
    const order = data.orders.find(o => o.id === id);
    if (!order) notFound();
    return (
        <>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
                <Link href="/orders">Orders</Link>
                <span>/</span>
                <span>{order.reference}</span>
            </nav>
            <div className="page-heading">
                <div>
                    <span className="eyebrow">Order details</span>
                    <h1>{order.reference}</h1>
                    <p>Original request, reviewed quotation and recorded progress.</p>
                </div>
            </div>
            <OrderDetail order={order} catalog={data.catalog} connected={configured()} />
        </>
    );
}
