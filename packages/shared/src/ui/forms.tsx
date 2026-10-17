'use client';
import { useState, type FormEvent } from 'react';
import {
    formatMUR,
    paymentLabels,
    priceLine,
    weight,
    type Catalog,
    type LineInput,
    type OrderRequest,
    type Product,
} from '../domain';
import { Button, Field, Notice, PackageBreakdown } from './primitives';
export function ProductConfigurator({
    product,
    initial,
    onAdd,
    label = 'Add to cart',
}: {
    product: Product;
    initial?: LineInput;
    onAdd: (line: LineInput) => void;
    label?: string;
}) {
    const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
    const portion = product.pack_sizes_g[0] || 500;
    const increment = product.allow_remainder ? product.step_g : (product.step_g * portion) / gcd(product.step_g, portion);
    const defaultGrams = Math.ceil(Math.max(1000, product.min_g) / increment) * increment;
    const [line, setLine] = useState<LineInput>(
        initial || {
            product_id: product.id,
            grams: defaultGrams,
            pack_g: product.pack_sizes_g[0] || 500,
            cut: product.cuts[0] || 'as supplied',
            note: '',
            mode: 'weight',
            pack_id: '',
            pack_count: 1,
        },
    );
    const [saved, setSaved] = useState(false);
    function update(patch: Partial<LineInput>) {
        setSaved(false);
        setLine(old => ({ ...old, ...patch }));
    }
    let error = '';
    let calculated;
    try {
        calculated = priceLine(product, line);
    } catch (e) {
        error = e instanceof Error ? e.message : 'Check your choices.';
    }
    function selectPack(id: string, count: number) {
        const pack = product.fixed_packs.find(p => p.id === id);
        update({ mode: 'pack', pack_id: id, pack_count: count, grams: (pack?.grams || 500) * count });
    }
    return (
        <form
            className="stack"
            onSubmit={(e: FormEvent) => {
                e.preventDefault();
                if (!error) {
                    onAdd(line);
                    setSaved(true);
                }
            }}
        >
            <fieldset>
                <legend>01 · Choose your quantity</legend>
                <div className="segmented">
                    <button type="button" aria-pressed={line.mode === 'weight'} onClick={() => update({ mode: 'weight' })}>
                        By weight
                    </button>
                    {product.fixed_packs.length > 0 && (
                        <button
                            type="button"
                            aria-pressed={line.mode === 'pack'}
                            onClick={() => selectPack(product.fixed_packs[0]?.id || '', 1)}
                        >
                            Fixed packs
                        </button>
                    )}
                </div>
                {line.mode === 'weight' ? (
                    <>
                        <Field
                            label="Weight (grams)"
                            hint={`Minimum ${weight(product.min_g)} · increments of ${weight(product.step_g)}`}
                        >
                            <input
                                type="number"
                                min={product.min_g}
                                max={1000000}
                                step={product.step_g}
                                value={line.grams}
                                onChange={e => update({ grams: Number(e.target.value) })}
                                required
                            />
                        </Field>
                        <div className="weight-presets">
                            {[500, 1000, 2000, 3000]
                                .filter(n => n >= product.min_g && n % product.step_g === 0)
                                .map(n => (
                                    <button
                                        type="button"
                                        aria-pressed={line.grams === n}
                                        key={n}
                                        onClick={() => update({ grams: n })}
                                    >
                                        {weight(n)}
                                    </button>
                                ))}
                        </div>
                    </>
                ) : (
                    <div className="form-grid">
                        <Field label="Fixed pack">
                            <select value={line.pack_id} onChange={e => selectPack(e.target.value, line.pack_count)}>
                                {product.fixed_packs.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {weight(p.grams)} · {formatMUR(p.price_cents)} / pack
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Number of packs">
                            <input
                                type="number"
                                min={1}
                                max={1000}
                                value={line.pack_count}
                                onChange={e => selectPack(line.pack_id, Number(e.target.value))}
                                required
                            />
                        </Field>
                    </div>
                )}
            </fieldset>
            <fieldset>
                <legend>02 · Cut & portion your way</legend>
                <div className="form-grid">
                    <Field label="Cutting preference">
                        <select value={line.cut} onChange={e => update({ cut: e.target.value })}>
                            {product.cuts.map(c => (
                                <option key={c}>{c}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Portion size">
                        <select value={line.pack_g} onChange={e => update({ pack_g: Number(e.target.value) })}>
                            {product.pack_sizes_g.map(g => (
                                <option value={g} key={g}>
                                    {weight(g)} per portion
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>
                {calculated && (
                    <div className="package-preview">
                        <strong>Your packaging</strong>
                        <span>
                            <PackageBreakdown line={calculated} />
                        </span>
                    </div>
                )}
            </fieldset>
            <Field
                label="Special instructions (optional)"
                hint="The vendor will review requests that need different cuts or yields."
            >
                <textarea
                    value={line.note}
                    maxLength={500}
                    rows={3}
                    placeholder="Anything the butcher should know?"
                    onChange={e => update({ note: e.target.value })}
                />
            </Field>
            {error && <Notice error>{error}</Notice>}
            {saved && <Notice>Saved with your weight, cut and portions.</Notice>}
            <div className="purchase-row">
                <div>
                    <small>Line estimate</small>
                    <strong>{calculated ? formatMUR(calculated.line_cents) : '—'}</strong>
                </div>
                <Button type="submit" disabled={Boolean(error)}>
                    {label} <span aria-hidden="true">→</span>
                </Button>
            </div>
        </form>
    );
}
export function RequestFields({ catalog, initial }: { catalog: Catalog; initial?: Partial<OrderRequest> }) {
    const [zone, setZone] = useState(initial?.zone_id || catalog.zones.find(z => z.active)?.id || '');
    const dates = catalog.offers.filter(d => d.zone_id === zone);
    const selected = catalog.zones.find(z => z.id === zone);
    return (
        <>
            <fieldset>
                <legend>Your contact details</legend>
                <div className="form-grid">
                    <Field label="Full name">
                        <input
                            name="name"
                            autoComplete="name"
                            defaultValue={initial?.contact?.name}
                            required
                            minLength={2}
                            maxLength={100}
                        />
                    </Field>
                    <Field label="Phone number">
                        <input
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            defaultValue={initial?.contact?.phone}
                            required
                            minLength={7}
                            maxLength={24}
                            placeholder="+230 …"
                        />
                    </Field>
                </div>
            </fieldset>
            <fieldset>
                <legend>Delivery, planned around your region</legend>
                <Field label="Delivery zone">
                    <select name="zone_id" value={zone} onChange={e => setZone(e.target.value)}>
                        {catalog.zones
                            .filter(z => z.active)
                            .map(z => (
                                <option value={z.id} key={z.id}>
                                    {z.name} · {formatMUR(z.fee_cents)}
                                </option>
                            ))}
                    </select>
                </Field>
                <p className="muted">{selected?.guidance}</p>
                <div className="form-grid">
                    <Field label="Locality">
                        <input
                            name="locality"
                            autoComplete="address-level2"
                            defaultValue={initial?.contact?.locality}
                            required
                            minLength={2}
                            maxLength={100}
                        />
                    </Field>
                    <Field label="Offered delivery date">
                        <select
                            name="date"
                            key={zone}
                            defaultValue={initial?.zone_id === zone ? initial.date : dates[0]?.date}
                            required
                        >
                            {dates.length ? (
                                dates.map(d => <option key={d.date}>{d.date}</option>)
                            ) : (
                                <option value="">No eligible dates — contact vendor</option>
                            )}
                        </select>
                    </Field>
                </div>
                <Field label="Address & landmark">
                    <textarea
                        name="address"
                        autoComplete="street-address"
                        defaultValue={initial?.contact?.address}
                        required
                        minLength={5}
                        maxLength={500}
                        rows={3}
                    />
                </Field>
            </fieldset>
            <fieldset>
                <legend>Payment preference</legend>
                <p className="muted">No payment is taken here. Transfers are verified manually by the vendor.</p>
                {catalog.payments
                    .filter(p => p.enabled)
                    .map((p, i) => (
                        <label className="radio-card" key={p.method}>
                            <input
                                type="radio"
                                name="payment_method"
                                value={p.method}
                                defaultChecked={initial?.payment_method ? initial.payment_method === p.method : i === 0}
                                required
                            />
                            <span>
                                <strong>{paymentLabels[p.method]}</strong>
                                <small>{p.instructions}</small>
                            </span>
                        </label>
                    ))}
            </fieldset>
        </>
    );
}
export function requestFromForm(form: HTMLFormElement, items: LineInput[], key: string) {
    const f = new FormData(form);
    return {
        idempotency_key: key,
        items,
        contact: { name: f.get('name'), phone: f.get('phone'), locality: f.get('locality'), address: f.get('address') },
        zone_id: f.get('zone_id'),
        date: f.get('date'),
        payment_method: f.get('payment_method'),
    };
}
export async function postJson(url: string, input: unknown): Promise<unknown> {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        cache: 'no-store',
    });
    const data: unknown = await response.json();
    if (!response.ok)
        throw new Error(
            typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string'
                ? data.error
                : 'The change was not confirmed. Please retry.',
        );
    return data;
}
