'use client';
import Link from 'next/link';
import { formatMUR, priceLine, weight, type Catalog } from '@laviann/shared/domain';
import { Button, EmptyState, Notice, PackageBreakdown, ProductArt } from '@laviann/shared/ui';
import { removeLine, useCart } from './cart-store';
export function Cart({ catalog }: { catalog: Catalog }) {
    const cart = useCart();
    const rows = cart.items.map(({ id, line }) => {
        const product = catalog.products.find(p => p.id === line.product_id);
        try {
            if (!product) throw new Error('This product is no longer available.');
            return { id, line, product, priced: priceLine(product, line), error: '' };
        } catch (e) {
            return { id, line, product, priced: null, error: e instanceof Error ? e.message : 'Review this item.' };
        }
    });
    const subtotal = rows.reduce((n, row) => n + (row.priced?.line_cents || 0), 0);
    const invalid = rows.some(row => Boolean(row.error));
    if (!cart.items.length)
        return (
            <EmptyState title="A good meal starts with a good cut.">
                <p>Your cart is empty. Pick your meat, weight and portions.</p>
                <Link className="btn btn-primary" href="/shop">
                    Explore the cuts →
                </Link>
            </EmptyState>
        );
    return (
        <div className="two-columns">
            <div className="stack">
                {rows.map(({ id, line, product, priced, error }) => {
                    return (
                        <article className="card cart-item" key={id}>
                            <div className="cart-thumb">
                                <ProductArt slug={product?.slug || 'hero'} name={product?.name || 'meat'} />
                            </div>
                            <div>
                                <h2>{product?.name || 'Unavailable product'}</h2>
                                <p>
                                    {weight(line.grams)}
                                    {priced && (
                                        <>
                                            {' '}
                                            · <PackageBreakdown line={priced} />
                                        </>
                                    )}
                                </p>
                                {line.note && <p className="muted break-text">{line.note}</p>}
                                <div className="actions">
                                    {product && (
                                        <Link className="link" href={`/product/${product.slug}?edit=${id}`}>
                                            Edit choices
                                        </Link>
                                    )}
                                    <Button variant="quiet" onClick={() => removeLine(id)}>
                                        Remove
                                    </Button>
                                </div>
                                {error && <Notice error>{error}</Notice>}
                            </div>
                            <strong>{priced ? formatMUR(priced.line_cents) : '—'}</strong>
                        </article>
                    );
                })}
            </div>
            <aside className="card stack">
                <h2>YOUR REQUEST</h2>
                <div className="summary-total">
                    <span>Product estimate</span>
                    <strong>{formatMUR(subtotal)}</strong>
                </div>
                <p className="muted">Packaging is included. Your delivery fee is calculated after you choose a region.</p>
                <Notice>You’ll approve a quotation after the vendor reviews your request. Stock is reserved at approval.</Notice>
                {invalid ? (
                    <Notice error>Update unavailable items before continuing.</Notice>
                ) : (
                    <Link className="btn btn-primary" href="/checkout">
                        Continue to delivery →
                    </Link>
                )}
                <Link className="link" href="/shop">
                    Keep browsing
                </Link>
            </aside>
        </div>
    );
}
