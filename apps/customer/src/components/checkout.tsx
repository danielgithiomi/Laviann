'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestSchema, type Catalog } from '@laviann/shared/domain';
import { Button, EmptyState, Notice, RequestFields, requestFromForm } from '@laviann/shared/ui';
import { saveDraft, useCart, useDraft } from './cart-store';
import Link from 'next/link';
export function Checkout({ catalog }: { catalog: Catalog }) {
    const cart = useCart();
    const draft = useDraft();
    const router = useRouter();
    const [error, setError] = useState('');
    if (!cart.items.length)
        return (
            <EmptyState title="Choose your cuts first">
                <Link href="/shop" className="btn btn-primary">
                    Browse the catalogue
                </Link>
            </EmptyState>
        );
    return (
        <div className="two-columns">
            <form
                className="card stack"
                onSubmit={e => {
                    e.preventDefault();
                    const parsed = requestSchema.safeParse(
                        requestFromForm(
                            e.currentTarget,
                            cart.items.map(i => i.line),
                            crypto.randomUUID(),
                        ),
                    );
                    if (!parsed.success) {
                        setError(parsed.error.issues.map(i => i.message).join(' '));
                        return;
                    }
                    saveDraft(parsed.data);
                    router.push('/review');
                }}
            >
                <RequestFields key={draft?.idempotency_key || 'new'} catalog={catalog} initial={draft || undefined} />
                {error && <Notice error>{error}</Notice>}
                <Button type="submit">Review your request →</Button>
            </form>
            <aside className="card stack">
                <span className="eyebrow">A little care, every step</span>
                <h2>
                    GOOD FOOD.
                    <br />
                    CLEAR EXPECTATIONS.
                </h2>
                <p className="muted">
                    Choose one of the vendor’s available dates for your region. The quote will confirm your exact products,
                    portions and delivery.
                </p>
                <Notice>Your request does not reserve stock or take payment.</Notice>
                <Link className="link" href="/cart">
                    ← Back to your cart
                </Link>
            </aside>
        </div>
    );
}
