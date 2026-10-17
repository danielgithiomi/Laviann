'use client';
import Link from 'next/link';
import { useState } from 'react';
import { formatMUR, orderStatuses, statusLabels, type Order, type Catalog } from '@laviann/shared/domain';
import { Badge, EmptyState, Field, StatusBadge } from '@laviann/shared/ui';
export function Orders({ orders, catalog }: { orders: Order[]; catalog: Catalog }) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [zone, setZone] = useState('');
    const [date, setDate] = useState('');
    const filtered = orders.filter(
        o =>
            `${o.reference} ${o.request.contact.name}`.toLowerCase().includes(search.toLowerCase()) &&
            (!status || o.status === status) &&
            (!zone || (o.quotes[0]?.zone_name || o.estimate.zone_name) === zone) &&
            (!date || (o.quotes[0]?.date || o.estimate.date) === date),
    );
    return (
        <>
            <div className="order-filters">
                <Field label="Search orders">
                    <input
                        type="search"
                        placeholder="Reference or customer name"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </Field>
                <Field label="Status">
                    <select value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="">All statuses</option>
                        {orderStatuses.map(s => (
                            <option key={s} value={s}>
                                {statusLabels[s]}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field label="Zone">
                    <select value={zone} onChange={e => setZone(e.target.value)}>
                        <option value="">All zones</option>
                        {catalog.zones.map(z => (
                            <option key={z.id}>{z.name}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Delivery date">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </Field>
            </div>
            <OrderTable orders={filtered} />
        </>
    );
}
export function OrderTable({ orders }: { orders: Order[] }) {
    if (!orders.length)
        return (
            <EmptyState title="Your queue is clear">
                <p>New website requests and manual WhatsApp orders will appear here.</p>
                <Link href="/orders/new" className="btn btn-primary">
                    Create a manual order
                </Link>
            </EmptyState>
        );
    return (
        <div className="table-card">
            <table className="responsive-table">
                <caption className="sr-only">Orders and independent payment status</caption>
                <thead>
                    <tr>
                        <th>Order / customer</th>
                        <th>Status</th>
                        <th>Delivery</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Review</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(o => {
                        const quote = o.quotes[0] || o.estimate;
                        return (
                            <tr key={o.id}>
                                <td data-label="Order">
                                    <Link className="order-reference" href={`/orders/${o.id}`}>
                                        {o.reference}
                                    </Link>
                                    <p>{o.request.contact.name}</p>
                                    <Badge>{o.origin === 'website' ? 'Website' : 'WhatsApp / phone'}</Badge>
                                </td>
                                <td data-label="Status">
                                    <StatusBadge status={o.status} />
                                </td>
                                <td data-label="Delivery">
                                    <strong>{quote.zone_name}</strong>
                                    <p>{quote.date}</p>
                                </td>
                                <td data-label="Total">
                                    <strong>{formatMUR(quote.total_cents)}</strong>
                                </td>
                                <td data-label="Payment">
                                    <span className="payment-label">{o.payment_status.replaceAll('_', ' ')}</span>
                                </td>
                                <td>
                                    <Link className="btn btn-secondary" href={`/orders/${o.id}`}>
                                        Review →
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
