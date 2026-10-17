'use client';
import { useState } from 'react';
import { z } from 'zod';
import {
    formatMUR,
    nextStatuses,
    paymentLabels,
    paymentStatuses,
    statusLabels,
    type Catalog,
    type LineInput,
    type Order,
    type PaymentStatus,
} from '@laviann/shared/domain';
import { Badge, Button, Field, Notice, OrderLines, ProductConfigurator, StatusBadge, Totals } from '@laviann/shared/ui';
import { useMutation } from './mutation';
export function OrderDetail({ order, catalog, connected }: { order: Order; catalog: Catalog; connected: boolean }) {
    const latest = order.quotes[0];
    const [lines, setLines] = useState<LineInput[]>(latest?.items || order.request.items);
    const [zone, setZone] = useState(latest?.zone_id || order.request.zone_id);
    const [date, setDate] = useState(latest?.date || order.request.date);
    const [note, setNote] = useState('');
    const [hours, setHours] = useState(48);
    const [edit, setEdit] = useState<number | null>(null);
    const [productId, setProductId] = useState(catalog.products[0]?.id || '');
    const [link, setLink] = useState('');
    const [copyNotice, setCopyNotice] = useState('');
    const [reason, setReason] = useState('');
    const [payment, setPayment] = useState<PaymentStatus>(order.payment_status);
    const [reference, setReference] = useState('');
    const mutation = useMutation(connected);
    const pending = ['pending_review', 'awaiting_customer_confirmation'].includes(order.status);
    const editingProduct = catalog.products.find(
        p => p.id === (edit === -1 ? productId : edit !== null ? lines[edit]?.product_id : ''),
    );
    const snapshot = latest || order.estimate;
    async function issue() {
        const input = {
            order_id: order.id,
            expected_version: latest?.version || 0,
            items: lines,
            zone_id: zone,
            date,
            note,
            expires_hours: hours,
        };
        const result = await mutation.run(
            'quote',
            { ...input, operation_key: mutation.keyFor(input) },
            'Quotation issued. Share the private link manually.',
        );
        if (result) setLink(z.object({ link: z.string() }).parse(result).link);
    }
    async function recover() {
        const result = await mutation.run('quote-link', { order_id: order.id }, 'Current link recovered.');
        if (result) setLink(z.object({ link: z.string() }).parse(result).link);
    }
    return (
        <div className="stack">
            <div className="detail-summary">
                <StatusBadge status={order.status} />
                <Badge>{order.origin === 'website' ? 'Website request' : 'WhatsApp / phone request'}</Badge>
                <strong>Payment: {order.payment_status.replaceAll('_', ' ')}</strong>
            </div>
            {mutation.error && <Notice error>{mutation.error}</Notice>}
            {mutation.message && <Notice>{mutation.message}</Notice>}
            <div className="two-columns">
                <div className="stack">
                    <section className="card stack">
                        <div className="section-heading">
                            <h2>{latest ? `QUOTATION V${latest.version}` : 'REQUESTED CUTS & PORTIONS'}</h2>
                            <strong>{formatMUR(snapshot.total_cents)}</strong>
                        </div>
                        <OrderLines lines={snapshot.items} />
                        <Totals
                            subtotal={snapshot.subtotal_cents}
                            fee={snapshot.fee_cents}
                            label={latest ? 'Quoted total' : 'Request estimate'}
                        />
                        {latest?.note && <Notice>{latest.note}</Notice>}
                        {latest?.approved_at && (
                            <p>
                                Customer approval recorded:{' '}
                                {new Date(latest.approved_at).toLocaleString('en-GB', { timeZone: 'Indian/Mauritius' })}{' '}
                                (Mauritius).
                            </p>
                        )}
                    </section>
                    {pending && (
                        <section className="card stack">
                            <h2>{latest ? 'PREPARE A REVISION' : 'REVIEW & ISSUE QUOTATION'}</h2>
                            <p className="muted">
                                Changes create a new version and invalidate the previous approval link. Prices come from the
                                current catalogue.
                            </p>
                            {lines.map((l, i) => (
                                <div key={i} className="editable-line">
                                    <span>
                                        {catalog.products.find(p => p.id === l.product_id)?.name} · {l.grams / 1000} kg ·{' '}
                                        {l.pack_g} g portions
                                    </span>
                                    <div className="actions">
                                        <Button variant="secondary" onClick={() => setEdit(i)}>
                                            Edit line {i + 1}
                                        </Button>
                                        <Button
                                            variant="quiet"
                                            onClick={() => setLines(old => old.filter((_, index) => index !== i))}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <div className="form-grid">
                                <Field label="Add a product">
                                    <select value={productId} onChange={e => setProductId(e.target.value)}>
                                        {catalog.products
                                            .filter(p => p.active)
                                            .map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                    </select>
                                </Field>
                                <Button variant="secondary" onClick={() => setEdit(-1)}>
                                    Configure another cut
                                </Button>
                            </div>
                            {editingProduct && edit !== null && (
                                <div className="editor-panel">
                                    <h3>EDIT CUT & PORTIONS</h3>
                                    <ProductConfigurator
                                        key={`${edit}-${editingProduct.id}`}
                                        product={editingProduct}
                                        initial={edit >= 0 ? lines[edit] : undefined}
                                        label="Use these choices"
                                        onAdd={line => {
                                            setLines(old =>
                                                edit === -1 ? [...old, line] : old.map((l, i) => (i === edit ? line : l)),
                                            );
                                            setEdit(null);
                                        }}
                                    />
                                    <Button variant="quiet" onClick={() => setEdit(null)}>
                                        Close editor
                                    </Button>
                                </div>
                            )}
                            <div className="form-grid">
                                <Field label="Quotation delivery zone">
                                    <select
                                        value={zone}
                                        onChange={e => {
                                            setZone(e.target.value);
                                            setDate(catalog.offers.find(d => d.zone_id === e.target.value)?.date || '');
                                        }}
                                    >
                                        {catalog.zones
                                            .filter(z => z.active)
                                            .map(z => (
                                                <option key={z.id} value={z.id}>
                                                    {z.name} · {formatMUR(z.fee_cents)}
                                                </option>
                                            ))}
                                    </select>
                                </Field>
                                <Field label="Quotation delivery date">
                                    <select value={date} onChange={e => setDate(e.target.value)}>
                                        <option value="">Choose an eligible date</option>
                                        {catalog.offers
                                            .filter(d => d.zone_id === zone)
                                            .map(d => (
                                                <option key={d.date}>{d.date}</option>
                                            ))}
                                    </select>
                                </Field>
                            </div>
                            <Field label="Changes / vendor notes">
                                <textarea
                                    value={note}
                                    maxLength={1000}
                                    onChange={e => setNote(e.target.value)}
                                    placeholder="Explain any changed weight, cut, portions or date."
                                />
                            </Field>
                            <Field label="Quotation valid for (hours)">
                                <input
                                    type="number"
                                    value={hours}
                                    min={1}
                                    max={168}
                                    onChange={e => setHours(Number(e.target.value))}
                                />
                            </Field>
                            <Button disabled={mutation.busy || !date || !lines.length} onClick={issue}>
                                {mutation.busy ? 'Issuing…' : `Issue quotation v${(latest?.version || 0) + 1}`}
                            </Button>
                        </section>
                    )}
                    {latest && (
                        <section className="card stack">
                            <h2>SHARE MANUALLY</h2>
                            <p className="muted">
                                No message is sent automatically. Approval links are private and version-specific.
                            </p>
                            {latest.status === 'issued' && (
                                <Button variant="secondary" disabled={mutation.busy} onClick={recover}>
                                    Get current approval link
                                </Button>
                            )}
                            {link && (
                                <>
                                    <Field label="Private quotation link">
                                        <input readOnly value={link} onFocus={e => e.target.select()} />
                                    </Field>
                                    <div className="actions">
                                        <Button
                                            onClick={async () => {
                                                try {
                                                    await navigator.clipboard.writeText(link);
                                                    setCopyNotice('Private link copied.');
                                                } catch {
                                                    setCopyNotice('Select and copy the link above.');
                                                }
                                            }}
                                        >
                                            Copy link
                                        </Button>
                                        <a
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn btn-secondary"
                                            href={`https://wa.me/${order.request.contact.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Your Laviann ${order.reference} quotation is ready. Total: ${formatMUR(snapshot.total_cents)}. Delivery: ${snapshot.zone_name}, ${snapshot.date}. Please review and approve: ${link}`)}`}
                                        >
                                            Open WhatsApp draft
                                        </a>
                                        <a className="link" href={link} target="_blank" rel="noreferrer">
                                            Open customer view
                                        </a>
                                    </div>
                                </>
                            )}
                            {copyNotice && <Notice>{copyNotice}</Notice>}
                        </section>
                    )}
                    <details className="card">
                        <summary>Original customer request & quotation history</summary>
                        <OrderLines lines={order.estimate.items} />
                        {order.quotes.map(q => (
                            <details key={q.id} className="history-item">
                                <summary>
                                    Version {q.version} · {q.status} · {formatMUR(q.total_cents)}
                                </summary>
                                <OrderLines lines={q.items} />
                                <p>
                                    {q.zone_name} · {q.date} · {q.note}
                                </p>
                            </details>
                        ))}
                    </details>
                </div>
                <aside className="stack">
                    <section className="card stack">
                        <h2>CUSTOMER & DELIVERY</h2>
                        <strong>{order.request.contact.name}</strong>
                        <a className="link" href={`tel:${order.request.contact.phone}`}>
                            {order.request.contact.phone}
                        </a>
                        <p>
                            {order.request.contact.address}
                            <br />
                            {order.request.contact.locality}
                        </p>
                        <p>
                            <strong>{snapshot.zone_name}</strong> · {snapshot.date}
                        </p>
                        <Badge>{paymentLabels[order.request.payment_method]}</Badge>
                    </section>
                    <section className="card stack">
                        <h2>FULFILLMENT</h2>
                        <p className="muted">
                            Preparing consumes reserved stock once. Cancellation after preparation never restores meat.
                        </p>
                        <Field label="Reason / delivery follow-up">
                            <textarea
                                value={reason}
                                maxLength={500}
                                onChange={e => setReason(e.target.value)}
                                placeholder="Required for cancellation, rejection or a follow-up note."
                            />
                        </Field>
                        <div className="stack-small">
                            {nextStatuses(order.status).map(status => (
                                <Button
                                    key={status}
                                    variant={['cancelled', 'rejected'].includes(status) ? 'secondary' : 'primary'}
                                    disabled={
                                        mutation.busy || (['cancelled', 'rejected'].includes(status) && reason.trim().length < 3)
                                    }
                                    onClick={() =>
                                        mutation.run(
                                            'transition',
                                            { order_id: order.id, status, reason },
                                            `Order marked ${statusLabels[status]}.`,
                                        )
                                    }
                                >
                                    Mark {statusLabels[status]}
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="secondary"
                            disabled={mutation.busy || reason.trim().length < 3}
                            onClick={() =>
                                mutation.run(
                                    'note',
                                    { order_id: order.id, note: reason },
                                    'Follow-up note recorded. Agreed delivery terms are unchanged.',
                                )
                            }
                        >
                            Record delivery follow-up
                        </Button>
                    </section>
                    <section className="card stack">
                        <h2>MANUAL PAYMENT RECORD</h2>
                        <p className="muted">Verify receipt yourself. Delivery never marks an order paid.</p>
                        <Field label="Payment status">
                            <select value={payment} onChange={e => setPayment(z.enum(paymentStatuses).parse(e.target.value))}>
                                {paymentStatuses.map(p => (
                                    <option key={p} value={p}>
                                        {p.replaceAll('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Verification note / reference">
                            <input value={reference} maxLength={200} onChange={e => setReference(e.target.value)} />
                        </Field>
                        <Button
                            disabled={mutation.busy || reference.trim().length < 3}
                            onClick={() => {
                                const input = { order_id: order.id, status: payment, reference };
                                return mutation.run(
                                    'payment',
                                    { ...input, operation_key: mutation.keyFor(input) },
                                    'Payment record saved.',
                                );
                            }}
                        >
                            Save payment record
                        </Button>
                    </section>
                    <section className="card stack">
                        <h2>ACTIVITY</h2>
                        {order.events.map(e => (
                            <div className="activity-item" key={e.id}>
                                <strong>{e.kind.replaceAll('_', ' ')}</strong>
                                <p>{e.note}</p>
                                <small>{new Date(e.created_at).toLocaleString('en-GB', { timeZone: 'Indian/Mauritius' })}</small>
                            </div>
                        ))}
                    </section>
                </aside>
            </div>
        </div>
    );
}
