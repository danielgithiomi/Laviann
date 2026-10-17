'use client';
import { useState } from 'react';
import Link from 'next/link';
import { formatMUR, type Catalog } from '@laviann/shared/domain';
import { Badge, EmptyState, Field, Icon, ProductArt } from '@laviann/shared/ui';
export function Catalogue({ catalog, category = '' }: { catalog: Catalog; category?: string }) {
    const [filter, setFilter] = useState(category);
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('featured');
    const products = catalog.products
        .filter(p => p.active && (!filter || p.category_id === filter) && p.name.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => (sort === 'price' ? a.price_cents - b.price_cents : a.name.localeCompare(b.name)));
    return (
        <section id="cuts" className="catalog-section">
            <div className="section-title">
                <div>
                    <span className="eyebrow">The butcher’s selection</span>
                    <h2>
                        {category
                            ? `${catalog.categories.find(c => c.id === category)?.name || 'Raw meat'} cuts`
                            : 'GOOD MEALS START HERE.'}
                    </h2>
                </div>
                <span className="muted">{products.length} cuts to make your own</span>
            </div>
            <div className="catalog-tools">
                <div className="segmented">
                    <button aria-pressed={!filter} onClick={() => setFilter('')}>
                        All cuts
                    </button>
                    {catalog.categories
                        .filter(c => c.active)
                        .map(c => (
                            <button key={c.id} aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>
                                {c.name}
                            </button>
                        ))}
                </div>
                <div className="catalog-search">
                    <Field label="Search cuts">
                        <input
                            type="search"
                            placeholder="Find your favourite cut…"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                    </Field>
                    <Field label="Sort">
                        <select value={sort} onChange={e => setSort(e.target.value)}>
                            <option value="featured">Name</option>
                            <option value="price">Price: low to high</option>
                        </select>
                    </Field>
                </div>
            </div>
            <div className="product-grid">
                {products.map(p => (
                    <Link className="product-card" key={p.id} href={`/product/${p.slug}`}>
                        <div className="product-picture">
                            <ProductArt slug={p.slug} name={p.name} />
                            <Badge>{catalog.categories.find(c => c.id === p.category_id)?.name}</Badge>
                        </div>
                        <div className="product-info">
                            <small>{p.available_g ? 'Choose your cut & portions' : 'Currently unavailable'}</small>
                            <h3>{p.name}</h3>
                            <div>
                                <strong>
                                    {formatMUR(p.price_cents)} <small>/ kg</small>
                                </strong>
                                <span className="product-arrow">
                                    <Icon name="arrow" size={18} />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            {!products.length && (
                <EmptyState title="No cuts match your search">
                    <p>Try another search or category.</p>
                </EmptyState>
            )}
            <p className="image-disclosure">
                Original product illustrations · vendor photography to follow{catalog.demo ? ' · all prices are demo values' : ''}
                .
            </p>
        </section>
    );
}
