'use client';
import { useState } from 'react';
import { formatMUR, type Catalog, type Product } from '@laviann/shared/domain';
import { Badge, Button, Field, Notice, ProductArt } from '@laviann/shared/ui';
import { useMutation } from './mutation';
function cents(input: FormDataEntryValue | null) {
    const s = String(input);
    if (!/^\d+(\.\d{1,2})?$/.test(s)) throw new Error('Enter a price with at most two decimal places.');
    const [whole = '0', fraction = ''] = s.split('.');
    return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}
export function Products({ catalog, connected }: { catalog: Catalog; connected: boolean }) {
    const mutation = useMutation(connected);
    const [error, setError] = useState('');
    const [newId, setNewId] = useState('');
    async function save(form: HTMLFormElement, product?: Product) {
        setError('');
        const f = new FormData(form);
        try {
            const input = {
                id: product?.id || newId,
                name: f.get('name'),
                slug: f.get('slug'),
                category_id: f.get('category_id'),
                description: f.get('description'),
                price_cents: cents(f.get('price')),
                min_g: Number(f.get('min_g')),
                step_g: Number(f.get('step_g')),
                cuts: String(f.get('cuts'))
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean),
                pack_sizes_g: String(f.get('pack_sizes_g'))
                    .split(',')
                    .map(s => Number(s.trim())),
                allow_remainder: f.get('allow_remainder') === 'on',
                fixed_packs: f
                    .getAll('fixed_id')
                    .map((id, index) => ({
                        id: String(id),
                        grams: Number(f.getAll('fixed_grams')[index]),
                        price_cents: cents(f.getAll('fixed_price')[index] ?? null),
                    })),
                active: f.get('active') === 'on',
            };
            const result = await mutation.run('product', input, 'Product saved. Existing quotations keep their original prices.');
            if (result && !product) setNewId('');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Check product settings.');
        }
    }
    function editor(product?: Product) {
        return (
            <form
                className="stack"
                onSubmit={e => {
                    e.preventDefault();
                    void save(e.currentTarget, product);
                }}
            >
                <div className="form-grid">
                    <Field label="Product name">
                        <input name="name" defaultValue={product?.name} required minLength={2} maxLength={100} />
                    </Field>
                    <Field label="URL name" hint="Lowercase words separated by hyphens.">
                        <input
                            name="slug"
                            defaultValue={product?.slug}
                            required
                            pattern="[a-z0-9]+(-[a-z0-9]+)*"
                            maxLength={80}
                        />
                    </Field>
                    <Field label="Raw-meat category">
                        <select name="category_id" defaultValue={product?.category_id}>
                            {catalog.categories.map(c => (
                                <option value={c.id} key={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Price per kg (Rs)">
                        <input
                            name="price"
                            type="number"
                            min="0"
                            max="1000000"
                            step="0.01"
                            defaultValue={(product?.price_cents || 0) / 100}
                            required
                        />
                    </Field>
                </div>
                <Field label="Description">
                    <textarea
                        name="description"
                        defaultValue={product?.description || 'Raw meat, prepared and portioned to order.'}
                        maxLength={600}
                    />
                </Field>
                <div className="form-grid">
                    <Field label="Minimum weight (grams)">
                        <input type="number" name="min_g" defaultValue={product?.min_g || 500} min={1} max={1000000} required />
                    </Field>
                    <Field label="Weight increment (grams)">
                        <input type="number" name="step_g" defaultValue={product?.step_g || 250} min={1} max={1000000} required />
                    </Field>
                </div>
                <Field label="Offered cuts" hint="Separate choices with commas.">
                    <input name="cuts" defaultValue={product?.cuts.join(', ') || 'as supplied, small pieces'} required />
                </Field>
                <Field label="Portion sizes (grams)" hint="Separate sizes with commas, for example 500, 1000.">
                    <input name="pack_sizes_g" defaultValue={product?.pack_sizes_g.join(', ') || '500, 1000'} required />
                </Field>
                <label className="check-row">
                    <input type="checkbox" name="allow_remainder" defaultChecked={product?.allow_remainder} />
                    Allow a smaller remainder portion
                </label>
                <FixedPacks initial={product?.fixed_packs || []} />
                <label className="check-row">
                    <input type="checkbox" name="active" defaultChecked={product?.active ?? true} />
                    Available in the catalogue
                </label>
                <p className="muted">
                    New products start with zero stock. Replenish their independent stock source in Inventory. Do not count whole
                    animals and their derived cuts twice.
                </p>
                <Button type="submit" disabled={mutation.busy}>
                    Save product
                </Button>
            </form>
        );
    }
    return (
        <div className="stack">
            {(error || mutation.error) && <Notice error>{error || mutation.error}</Notice>}
            {mutation.message && <Notice>{mutation.message}</Notice>}
            <div className="actions">
                <Button onClick={() => setNewId(crypto.randomUUID())}>＋ Add raw-meat product</Button>
            </div>
            {newId && (
                <section className="card stack">
                    <h2>NEW RAW-MEAT PRODUCT</h2>
                    {editor()}
                    <Button variant="quiet" onClick={() => setNewId('')}>
                        Close
                    </Button>
                </section>
            )}
            <div className="product-admin-grid">
                {catalog.products.map(p => (
                    <details className="card product-editor" key={p.id}>
                        <summary>
                            <ProductArt slug={p.slug} name={p.name} />
                            <div>
                                <strong>{p.name}</strong>
                                <p>{formatMUR(p.price_cents)} / kg</p>
                                <Badge>{p.active ? 'Active' : 'Unavailable'}</Badge>
                            </div>
                            <span>Edit ↓</span>
                        </summary>
                        {editor(p)}
                    </details>
                ))}
            </div>
            <section className="card stack">
                <h2>RAW-MEAT CATEGORIES</h2>
                <p className="muted">
                    Initial catalogue: Chicken and Beef. Categories can grow as vendor data, without source changes.
                </p>
                {catalog.categories.map(c => (
                    <form
                        className="form-grid"
                        key={c.id}
                        onSubmit={async e => {
                            e.preventDefault();
                            const f = new FormData(e.currentTarget);
                            await mutation.run('category', {
                                ...c,
                                name: String(f.get('name')),
                                active: f.get('active') === 'on',
                            });
                        }}
                    >
                        <Field label={`${c.name} category name`}>
                            <input name="name" defaultValue={c.name} required minLength={2} />
                        </Field>
                        <div className="actions">
                            <label className="check-row">
                                <input name="active" type="checkbox" defaultChecked={c.active} />
                                Active
                            </label>
                            <Button type="submit" variant="secondary" disabled={mutation.busy}>
                                Save category
                            </Button>
                        </div>
                    </form>
                ))}
                <form
                    className="stack"
                    onSubmit={async e => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const f = new FormData(form);
                        const result = await mutation.run(
                            'category',
                            { id: crypto.randomUUID(), name: f.get('name'), slug: f.get('slug'), active: true },
                            'Raw-meat category added.',
                        );
                        if (result) form.reset();
                    }}
                >
                    <div className="form-grid">
                        <Field label="New raw-meat category">
                            <input name="name" minLength={2} maxLength={60} required />
                        </Field>
                        <Field label="Category URL name">
                            <input name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" required />
                        </Field>
                    </div>
                    <Button type="submit" variant="secondary" disabled={mutation.busy}>
                        Add category
                    </Button>
                </form>
            </section>
        </div>
    );
}

function FixedPacks({ initial }: { initial: Product['fixed_packs'] }) {
    const [packs, setPacks] = useState(initial);
    return (
        <fieldset>
            <legend>Optional fixed-price packs</legend>
            <p className="muted">Offer a set weight at its own price. Portions are still chosen separately.</p>
            {packs.map((pack, index) => (
                <div className="stack-small" key={pack.id}>
                    <input type="hidden" name="fixed_id" value={pack.id} />
                    <div className="form-grid">
                        <Field label={`Pack ${index + 1} weight (grams)`}>
                            <input type="number" name="fixed_grams" min={1} max={1000000} defaultValue={pack.grams} required />
                        </Field>
                        <Field label={`Pack ${index + 1} price (Rs)`}>
                            <input
                                type="number"
                                name="fixed_price"
                                min={0}
                                max={1000000}
                                step="0.01"
                                defaultValue={pack.price_cents / 100}
                                required
                            />
                        </Field>
                    </div>
                    <Button variant="quiet" onClick={() => setPacks(old => old.filter(p => p.id !== pack.id))}>
                        Remove pack {index + 1}
                    </Button>
                </div>
            ))}
            <Button
                variant="secondary"
                disabled={packs.length >= 12}
                onClick={() => setPacks(old => [...old, { id: crypto.randomUUID(), grams: 500, price_cents: 0 }])}
            >
                Add fixed pack
            </Button>
        </fieldset>
    );
}
