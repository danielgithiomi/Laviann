'use client';
import { isLowStock, weight, type VendorData } from '@laviann/shared/domain';
import { Badge, Button, Field, Notice } from '@laviann/shared/ui';
import { useMutation } from './mutation';
export function Inventory({ data, connected }: { data: VendorData; connected: boolean }) {
    const mutation = useMutation(connected);
    return (
        <div className="stack">
            <Notice>
                Available = physical on-hand − reserved. Separate cuts are independently replenished; whole-to-cut yield
                conversion is not supported.
            </Notice>
            {mutation.error && <Notice error>{mutation.error}</Notice>}
            {mutation.message && <Notice>{mutation.message}</Notice>}
            <div className="inventory-grid">
                {data.inventory.map(i => (
                    <section className="card stack" key={i.id}>
                        <div className="section-heading">
                            <h2>{i.name}</h2>
                            <Badge tone={isLowStock(i) ? 'warm' : ''}>{isLowStock(i) ? 'Low stock' : 'Healthy'}</Badge>
                        </div>
                        <div className="stock-values">
                            <div>
                                <small>On hand</small>
                                <strong>{weight(i.on_hand_g)}</strong>
                            </div>
                            <div>
                                <small>Reserved</small>
                                <strong>{weight(i.reserved_g)}</strong>
                            </div>
                            <div>
                                <small>Available</small>
                                <strong>{weight(i.on_hand_g - i.reserved_g)}</strong>
                            </div>
                        </div>
                        <div
                            className="stock-meter"
                            role="meter"
                            aria-label={`${i.name} available stock relative to target`}
                            aria-valuemin={0}
                            aria-valuemax={i.target_g}
                            aria-valuenow={Math.min(i.target_g, i.on_hand_g - i.reserved_g)}
                        >
                            <span style={{ width: `${Math.min(100, ((i.on_hand_g - i.reserved_g) / i.target_g) * 100)}%` }} />
                        </div>
                        <p className="muted">
                            Warning at {i.threshold_percent}% of {weight(i.target_g)} target.
                        </p>
                        <details>
                            <summary>Replenish, adjust or change target</summary>
                            <form
                                className="stack section-gap"
                                onSubmit={async e => {
                                    e.preventDefault();
                                    const f = new FormData(e.currentTarget);
                                    const input = {
                                        stock_id: i.id,
                                        delta_g: Number(f.get('delta_g')),
                                        target_g: Number(f.get('target_g')),
                                        threshold_percent: Number(f.get('threshold_percent')),
                                        reason: String(f.get('reason')),
                                    };
                                    await mutation.run(
                                        'stock',
                                        { ...input, operation_key: mutation.keyFor(input) },
                                        'Inventory updated; movement recorded.',
                                    );
                                }}
                            >
                                <Field
                                    label="Stock change (grams)"
                                    hint="Positive adds stock; negative records loss. Zero only changes the target/alert."
                                >
                                    <input type="number" name="delta_g" defaultValue={0} min={-1000000} max={1000000} required />
                                </Field>
                                <div className="form-grid">
                                    <Field label="Target stock (grams)">
                                        <input
                                            type="number"
                                            name="target_g"
                                            defaultValue={i.target_g}
                                            min={1}
                                            max={1000000}
                                            required
                                        />
                                    </Field>
                                    <Field label="Warning threshold (%)">
                                        <input
                                            type="number"
                                            name="threshold_percent"
                                            defaultValue={i.threshold_percent}
                                            min={1}
                                            max={100}
                                            required
                                        />
                                    </Field>
                                </div>
                                <Field label="Reason">
                                    <input
                                        name="reason"
                                        minLength={3}
                                        maxLength={500}
                                        placeholder="Replenishment, spoilage or count correction"
                                        required
                                    />
                                </Field>
                                <Button type="submit" disabled={mutation.busy}>
                                    Record adjustment
                                </Button>
                            </form>
                        </details>
                    </section>
                ))}
            </div>
            <section className="card stack">
                <h2>RECENT STOCK MOVEMENTS</h2>
                {!data.movements.length && (
                    <p className="muted">Reservations, consumption, releases and adjustments will appear here.</p>
                )}
                {data.movements.map(m => (
                    <div className="movement" key={m.id}>
                        <div>
                            <strong>{data.inventory.find(i => i.id === m.stock_id)?.name}</strong>
                            <p>{m.reason}</p>
                        </div>
                        <Badge>{m.kind}</Badge>
                        <span>
                            On-hand {m.on_hand_delta > 0 ? '+' : ''}
                            {m.on_hand_delta} g · reserved {m.reserved_delta > 0 ? '+' : ''}
                            {m.reserved_delta} g
                        </span>
                        <small>{new Date(m.created_at).toLocaleString('en-GB', { timeZone: 'Indian/Mauritius' })}</small>
                    </div>
                ))}
            </section>
        </div>
    );
}
