'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { requestSchema, weight, type Catalog, type LineInput } from '@laviann/shared/domain';
import { Button, Field, Notice, ProductConfigurator, RequestFields, requestFromForm } from '@laviann/shared/ui';
import { useMutation } from './mutation';
export function ManualOrder({ catalog, connected }: { catalog: Catalog; connected: boolean }) {
    const [items, setItems] = useState<LineInput[]>([]);
    const [selected, setSelected] = useState(catalog.products[0]?.id || '');
    const mutation = useMutation(connected);
    const router = useRouter();
    const [error, setError] = useState('');
    const product = catalog.products.find(p => p.id === selected);
    return (
        <div className="two-columns">
            <div className="stack">
                <Notice>
                    Transcribe a WhatsApp or phone request. It enters Pending Review and follows the same quotation approval
                    workflow.
                </Notice>
                <section className="card stack">
                    <h2>BUILD THE REQUEST</h2>
                    <Field label="Choose a product">
                        <select value={selected} onChange={e => setSelected(e.target.value)}>
                            {catalog.products
                                .filter(p => p.active)
                                .map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                        </select>
                    </Field>
                    {product && (
                        <ProductConfigurator
                            key={product.id}
                            product={product}
                            onAdd={line => setItems(old => [...old, line])}
                            label="Add to request"
                        />
                    )}
                </section>
                <section className="card stack">
                    <h2>{items.length} CONFIGURED ITEMS</h2>
                    {items.map((l, i) => (
                        <div className="editable-line" key={i}>
                            <span>
                                {catalog.products.find(p => p.id === l.product_id)?.name} · {weight(l.grams)} · {l.pack_g} g
                                portions · {l.cut}
                                <small className="break-text">{l.note}</small>
                            </span>
                            <Button variant="quiet" onClick={() => setItems(old => old.filter((_, n) => n !== i))}>
                                Remove
                            </Button>
                        </div>
                    ))}
                </section>
            </div>
            <form
                className="card stack"
                onSubmit={async e => {
                    e.preventDefault();
                    setError('');
                    const raw = requestFromForm(e.currentTarget, items, crypto.randomUUID());
                    const fingerprint = { ...raw, idempotency_key: '' };
                    const parsed = requestSchema.safeParse({ ...raw, idempotency_key: mutation.keyFor(fingerprint) });
                    if (!parsed.success) {
                        setError(parsed.error.issues.map(i => i.message).join(' '));
                        return;
                    }
                    const result = await mutation.run('manual', parsed.data, 'Manual request saved.');
                    if (result) {
                        const { result: order } = z.object({ result: z.object({ id: z.uuid() }) }).parse(result);
                        router.push(`/orders/${order.id}`);
                    }
                }}
            >
                <RequestFields catalog={catalog} />
                {(error || mutation.error) && <Notice error>{error || mutation.error}</Notice>}
                <Button type="submit" disabled={mutation.busy || !items.length}>
                    {mutation.busy ? 'Saving…' : 'Create manual order request'}
                </Button>
            </form>
        </div>
    );
}
