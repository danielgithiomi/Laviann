'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { guestOrderSchema, quoteChanges, paymentLabels, statusLabels, type GuestOrder } from '@laviann/shared/domain';
import { Button, Field, Notice, OrderLines, StatusBadge, Timeline, Totals, postJson } from '@laviann/shared/ui';
export function Guest({ submitted = false }: { submitted?: boolean }) {
    const [order, setOrder] = useState<GuestOrder | null>(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [token, setToken] = useState('');
    const [reference, setReference] = useState('');
    const [copied, setCopied] = useState(false);
    const requestId = useRef(0);
    useEffect(() => {
        let ignore = false;
        function load() {
            const value = window.location.hash.slice(1);
            const currentRequest = ++requestId.current;
            postJson('/api/guest', { token: value, action: 'view' })
                .then(data => {
                    if (!ignore && currentRequest === requestId.current) {
                        setOrder(guestOrderSchema.parse(data));
                        setToken(value);
                        setError('');
                    }
                })
                .catch(e => {
                    if (!ignore && currentRequest === requestId.current) {
                        setOrder(null);
                        setError(e instanceof Error ? e.message : 'Link unavailable.');
                    }
                });
        }
        function onHashChange() {
            setOrder(null);
            setToken('');
            setError('');
            setReference('');
            setCopied(false);
            setBusy(false);
            load();
        }
        load();
        window.addEventListener('hashchange', onHashChange);
        return () => {
            ignore = true;
            window.removeEventListener('hashchange', onHashChange);
        };
    }, []);
    async function act(action: 'view' | 'approve' | 'report') {
        const currentRequest = ++requestId.current;
        const isCurrent = () => currentRequest === requestId.current && window.location.hash.slice(1) === token;
        setBusy(true);
        setError('');
        try {
            const result = guestOrderSchema.parse(await postJson('/api/guest', { token, action, reference }));
            if (isCurrent()) setOrder(result);
        } catch (e) {
            if (isCurrent()) setError(e instanceof Error ? e.message : 'Action not confirmed. Retry safely.');
        } finally {
            if (isCurrent()) setBusy(false);
        }
    }
    if (!order)
        return (
            <div className="card stack">
                <h1>{error ? 'LET’S CHECK THAT LINK.' : 'OPENING YOUR ORDER…'}</h1>
                <Notice error={Boolean(error)}>{error || 'Loading your private order securely.'}</Notice>
                <p>
                    Use the complete private link from the vendor. If it expired or the quotation changed, ask for the latest
                    link.
                </p>
                <Link className="link" href="/shop">
                    Back to the shop
                </Link>
            </div>
        );
    const quote = order.quotes[0];
    const snapshot = quote || order.estimate;
    const changes = quote ? quoteChanges(order.estimate, quote) : [];
    return (
        <div className="stack">
            <div className="page-heading">
                <div>
                    <span className="eyebrow">{order.reference}</span>
                    <h1>
                        {submitted && order.status === 'pending_review'
                            ? 'YOUR REQUEST IS WITH US.'
                            : quote
                              ? `YOUR QUOTATION · V${quote.version}`
                              : 'YOUR ORDER, AT A GLANCE.'}
                    </h1>
                    <p>
                        {submitted
                            ? 'Keep your private link to return to this request.'
                            : 'Your reviewed products, portions and delivery commitment.'}
                    </p>
                </div>
                <StatusBadge status={order.status} />
            </div>
            {error && <Notice error>{error}</Notice>}
            <div className="two-columns">
                <section className="card stack">
                    <div className="actions">
                        <h2>{quote ? 'REVIEWED QUOTATION' : 'REQUEST ESTIMATE'}</h2>
                        {quote && <span>Version {quote.version}</span>}
                    </div>
                    {quote && (
                        <div className="quote-changes">
                            <h3>Compared with your request</h3>
                            {changes.length ? (
                                <ul>
                                    {changes.map(change => (
                                        <li key={change}>{change}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Your products, portions, price and delivery match your request.</p>
                            )}
                        </div>
                    )}
                    {quote?.note && <Notice>Vendor’s changes / notes: {quote.note}</Notice>}
                    <OrderLines lines={snapshot.items} />
                    <Totals
                        subtotal={snapshot.subtotal_cents}
                        fee={snapshot.fee_cents}
                        label={quote ? 'Quotation total' : 'Estimated total'}
                    />
                    <p>
                        {snapshot.zone_name} · {snapshot.date}
                    </p>
                    {quote && (
                        <p className="muted">
                            {quote.status === 'approved'
                                ? `Approved ${new Date(quote.approved_at || '').toLocaleString('en-GB', { timeZone: 'Indian/Mauritius' })}`
                                : `Valid until ${new Date(quote.expires_at).toLocaleString('en-GB', { timeZone: 'Indian/Mauritius' })} (Mauritius)`}
                        </p>
                    )}
                    {order.can_approve && (
                        <>
                            <Notice>
                                Approving accepts this exact version. We will recheck your delivery date and reserve stock
                                together; a shortage leaves the order unconfirmed.
                            </Notice>
                            <Button onClick={() => act('approve')} disabled={busy}>
                                {busy ? 'Checking stock…' : 'Approve this quotation'}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(
                                            `Please revise Laviann ${order.reference}, quotation v${quote?.version}. My requested changes: `,
                                        );
                                        setCopied(true);
                                    } catch {
                                        setError(
                                            'Copy is unavailable. Contact the vendor with your order reference and requested changes.',
                                        );
                                    }
                                }}
                            >
                                Copy a request for changes
                            </Button>
                        </>
                    )}
                    <div className="actions">
                        <Button variant="secondary" onClick={() => window.print()}>
                            Print quotation / status
                        </Button>
                        <Button variant="quiet" onClick={() => act('view')} disabled={busy}>
                            Refresh status
                        </Button>
                    </div>
                </section>
                <aside className="stack">
                    <section className="card stack">
                        <h2>{statusLabels[order.status].toUpperCase()}</h2>
                        <Timeline status={order.status} />
                        <p className="muted">Only recorded stages are marked complete.</p>
                    </section>
                    <section className="card stack">
                        <h2>PAYMENT</h2>
                        <strong>{order.payment_status.replaceAll('_', ' ')}</strong>
                        <p>{paymentLabels[order.payment_method]}</p>
                        <p className="muted">{order.payment_instructions}</p>
                        {['confirmed', 'preparing', 'ready_for_delivery', 'out_for_delivery', 'delivered'].includes(
                            order.status,
                        ) &&
                            order.payment_method !== 'cash_on_delivery' &&
                            ['unpaid', 'failed'].includes(order.payment_status) && (
                                <>
                                    <Field label="Transfer reference">
                                        <input value={reference} maxLength={200} onChange={e => setReference(e.target.value)} />
                                    </Field>
                                    <Button
                                        variant="secondary"
                                        disabled={busy || reference.trim().length < 3}
                                        onClick={() => act('report')}
                                    >
                                        Report a transfer
                                    </Button>
                                    <small>This does not mark your order paid. The vendor must verify it.</small>
                                </>
                            )}
                    </section>
                    <Button
                        variant="secondary"
                        onClick={async () => {
                            try {
                                await navigator.clipboard.writeText(`${location.origin}/status#${token}`);
                                setCopied(true);
                            } catch {
                                setError('Copy is unavailable. Save the complete URL from your address bar.');
                            }
                        }}
                    >
                        Copy private status link
                    </Button>
                    {copied && <Notice>Copied. Share this private information only with its intended recipient.</Notice>}
                </aside>
            </div>
            <Link className="link" href="/shop">
                Continue browsing →
            </Link>
        </div>
    );
}
