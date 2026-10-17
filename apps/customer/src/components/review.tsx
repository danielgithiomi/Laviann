'use client';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { estimateSchema, paymentLabels } from '@laviann/shared/domain';
import { Button, EmptyState, Notice, OrderLines, Totals, postJson } from '@laviann/shared/ui';
import { clearCart, saveDraft, useDraft } from './cart-store';
export function Review({ connected }: { connected: boolean }) {
    const draft = useDraft();
    const router = useRouter();
    const [estimate, setEstimate] = useState<z.infer<typeof estimateSchema> | null>(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        if (!draft || !connected) return;
        let ignore = false;
        postJson('/api/estimate', draft)
            .then(d => {
                if (!ignore) setEstimate(estimateSchema.parse(d));
            })
            .catch(e => {
                if (!ignore) setError(e instanceof Error ? e.message : 'Estimate unavailable.');
            });
        return () => {
            ignore = true;
        };
    }, [draft, connected]);
    if (!draft)
        return (
            <EmptyState title="Your request is not ready yet">
                <Link className="btn btn-primary" href="/checkout">
                    Complete delivery details
                </Link>
            </EmptyState>
        );
    async function submit() {
        setBusy(true);
        setError('');
        try {
            const result = z.object({ token: z.string() }).parse(await postJson('/api/requests', draft));
            clearCart();
            saveDraft(null);
            router.push(`/submitted#${result.token}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Request not confirmed. Retry safely.');
        } finally {
            setBusy(false);
        }
    }
    return (
        <div className="two-columns">
            <section className="card stack">
                <h2>ONE LAST LOOK.</h2>
                {estimate ? (
                    <>
                        <OrderLines lines={estimate.items} />
                        <Totals subtotal={estimate.subtotal_cents} fee={estimate.fee_cents} />
                    </>
                ) : (
                    <Notice>
                        {connected
                            ? 'Checking your estimate with the vendor’s current prices…'
                            : 'Preview only. Connect Supabase to calculate a trusted estimate and save a request.'}
                    </Notice>
                )}
                <Link className="link" href="/cart">
                    Edit products & portions
                </Link>
            </section>
            <aside className="card stack">
                <h2>DELIVERY DETAILS</h2>
                <div>
                    <strong>{draft.contact.name}</strong>
                    <p>{draft.contact.phone}</p>
                    <p>{draft.contact.address}</p>
                    <p>
                        {draft.contact.locality} · {estimate?.zone_name}
                    </p>
                    <p>{draft.date}</p>
                </div>
                <p>{paymentLabels[draft.payment_method]}</p>
                <Link className="link" href="/checkout">
                    Edit delivery details
                </Link>
                <Notice>
                    The vendor will review this request and share a quotation. You must approve that quotation before stock is
                    reserved.
                </Notice>
                {error && <Notice error>{error}</Notice>}
                <Button onClick={submit} disabled={!estimate || !connected || busy}>
                    {busy ? 'Submitting…' : 'Submit order request'}
                </Button>
            </aside>
        </div>
    );
}
