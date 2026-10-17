'use client';
import Link from 'next/link';
import { formatMUR, type Product } from '@laviann/shared/domain';
import { Badge, Icon, ProductArt, ProductConfigurator } from '@laviann/shared/ui';
import { addLine, useCart } from './cart-store';
export function ProductDetail({ product, editId }: { product: Product; editId?: string }) {
    const cart = useCart();
    const existing = cart.items.find(i => i.id === editId);
    return (
        <div className="product-detail">
            <div>
                <div className="detail-picture">
                    <ProductArt slug={product.slug} name={product.name} priority />
                </div>
                <p className="image-disclosure">Product illustration. Actual vendor photos will be added later.</p>
                <div className="care-note">
                    <Icon name="cut" />
                    <p>
                        Your weight. Your portions.
                        <br />
                        <strong>Prepared after you approve your quote.</strong>
                    </p>
                </div>
            </div>
            <section className="detail-form">
                <Badge>{product.available_g ? 'Available for request' : 'Currently unavailable'}</Badge>
                <h1>{product.name.toUpperCase()}</h1>
                <p className="detail-price">
                    {formatMUR(product.price_cents)} <span>/ kg</span>
                </p>
                <p className="muted">{product.description}</p>
                <ProductConfigurator
                    key={existing?.id || product.id}
                    product={product}
                    initial={existing?.line}
                    onAdd={line => addLine(line, existing?.id)}
                    label={existing ? 'Save changes' : 'Add to cart'}
                />
                <Link className="link" href="/cart">
                    Review your cart →
                </Link>
            </section>
        </div>
    );
}
