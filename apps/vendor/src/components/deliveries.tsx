'use client';
import Link from 'next/link';
import { useState } from 'react';
import { statusLabels, type VendorData } from '@laviann/shared/domain';
import { Button, EmptyState, Field, Notice, OrderLines, StatusBadge } from '@laviann/shared/ui';
import { useMutation } from './mutation';
export function Deliveries({ data, connected }: { data: VendorData; connected: boolean }) {
    const [zone, setZone] = useState('');
    const [date, setDate] = useState('');
    const mutation = useMutation(connected);
    const orders = data.orders.filter(
        o =>
            ['confirmed', 'preparing', 'ready_for_delivery', 'out_for_delivery', 'delivered'].includes(o.status) &&
            (!zone || o.quotes[0]?.zone_name === zone) &&
            (!date || o.quotes[0]?.date === date),
    );
    const groups = Array.from(new Set(orders.map(o => `${o.quotes[0]?.date} · ${o.quotes[0]?.zone_name}`))).sort();
    return (
        <div className="stack">
            <div className="form-grid">
                <Field label="Delivery region">
                    <select value={zone} onChange={e => setZone(e.target.value)}>
                        <option value="">All regions</option>
                        {data.catalog.zones.map(z => (
                            <option key={z.id}>{z.name}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Delivery day">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </Field>
            </div>
            {mutation.error && <Notice error>{mutation.error}</Notice>}
            {mutation.message && <Notice>{mutation.message}</Notice>}
            {!orders.length && (
                <EmptyState title="No deliveries in this selection">
                    <p>Confirmed quotations will join their region’s delivery group.</p>
                </EmptyState>
            )}
            {groups.map(group => (
                <section className="card stack" key={group}>
                    <h2>{group}</h2>
                    {orders
                        .filter(o => `${o.quotes[0]?.date} · ${o.quotes[0]?.zone_name}` === group)
                        .map(o => {
                            const next =
                                o.status === 'ready_for_delivery'
                                    ? 'out_for_delivery'
                                    : o.status === 'out_for_delivery'
                                      ? 'delivered'
                                      : null;
                            return (
                                <article className="delivery-card" key={o.id}>
                                    <div>
                                        <Link href={`/orders/${o.id}`} className="link">
                                            <strong>{o.reference}</strong>
                                        </Link>
                                        <p>
                                            {o.request.contact.name} ·{' '}
                                            <a className="link" href={`tel:${o.request.contact.phone}`}>
                                                {o.request.contact.phone}
                                            </a>
                                        </p>
                                        <p>
                                            {o.request.contact.address}, {o.request.contact.locality}
                                        </p>
                                        <details>
                                            <summary>Products & packaging</summary>
                                            <OrderLines lines={o.quotes[0]?.items || o.estimate.items} />
                                        </details>
                                    </div>
                                    <div className="stack-small">
                                        <StatusBadge status={o.status} />
                                        <small>Payment: {o.payment_status.replaceAll('_', ' ')}</small>
                                        {next && (
                                            <Button
                                                disabled={mutation.busy}
                                                onClick={() =>
                                                    mutation.run(
                                                        'transition',
                                                        { order_id: o.id, status: next, reason: '' },
                                                        `Order marked ${statusLabels[next]}.`,
                                                    )
                                                }
                                            >
                                                Mark {statusLabels[next]}
                                            </Button>
                                        )}
                                        <Link href={`/orders/${o.id}`} className="link">
                                            Details / failed delivery follow-up
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                </section>
            ))}
        </div>
    );
}
