'use client';
import { paymentLabels, type VendorData } from '@laviann/shared/domain';
import { Button, Field, Notice } from '@laviann/shared/ui';
import { useMutation } from './mutation';
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export function DeliverySettings({ data, connected }: { data: VendorData; connected: boolean }) {
    const mutation = useMutation(connected);
    return (
        <div className="stack">
            <Notice>
                All cutoffs use Mauritius time (UTC+4). Settings affect new quotes and approval eligibility. Approved delivery
                charges and dates remain unchanged.
            </Notice>
            {mutation.error && <Notice error>{mutation.error}</Notice>}
            {mutation.message && <Notice>{mutation.message}</Notice>}
            <div className="settings-grid">
                {data.catalog.zones.map(z => (
                    <form
                        className="card stack"
                        key={z.id}
                        onSubmit={async e => {
                            e.preventDefault();
                            const f = new FormData(e.currentTarget);
                            await mutation.run(
                                'zone',
                                {
                                    ...z,
                                    fee_cents: Math.round(Number(f.get('fee')) * 100),
                                    weekdays: f.getAll('weekdays').map(Number),
                                    cutoff_time: String(f.get('cutoff_time')),
                                    cutoff_days: Number(f.get('cutoff_days')),
                                    guidance: String(f.get('guidance')),
                                    active: f.get('active') === 'on',
                                },
                                'Delivery settings saved.',
                            );
                        }}
                    >
                        <h2>{z.name.toUpperCase()}</h2>
                        <Field label={`${z.name} delivery fee (Rs)`}>
                            <input
                                name="fee"
                                type="number"
                                min={0}
                                max={1000000}
                                step="0.01"
                                defaultValue={z.fee_cents / 100}
                                required
                            />
                        </Field>
                        <fieldset>
                            <legend>Weekly delivery days</legend>
                            <div className="day-choices">
                                {days.map((d, i) => (
                                    <label key={d}>
                                        <input
                                            type="checkbox"
                                            name="weekdays"
                                            value={i}
                                            defaultChecked={z.weekdays.includes(i)}
                                        />
                                        {d}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                        <div className="form-grid">
                            <Field label="Cutoff time (Mauritius)">
                                <input type="time" name="cutoff_time" defaultValue={z.cutoff_time.slice(0, 5)} required />
                            </Field>
                            <Field label="Days before delivery">
                                <input type="number" name="cutoff_days" min={0} max={14} defaultValue={z.cutoff_days} required />
                            </Field>
                        </div>
                        <Field label="Locality / coverage guidance">
                            <textarea name="guidance" maxLength={300} defaultValue={z.guidance} />
                        </Field>
                        <label className="check-row">
                            <input type="checkbox" name="active" defaultChecked={z.active} />
                            Offer delivery to this zone
                        </label>
                        <Button type="submit" disabled={mutation.busy}>
                            Save {z.name}
                        </Button>
                    </form>
                ))}
            </div>
            <section className="card stack">
                <h2>EXTRA DATES & CLOSURES</h2>
                <form
                    className="stack"
                    onSubmit={async e => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget);
                        await mutation.run(
                            'exception',
                            { zone_id: String(f.get('zone')), date: String(f.get('date')), offered: f.get('offered') === 'yes' },
                            'Date exception saved.',
                        );
                    }}
                >
                    <div className="form-grid">
                        <Field label="Exception zone">
                            <select name="zone">
                                {data.catalog.zones.map(z => (
                                    <option key={z.id} value={z.id}>
                                        {z.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Exception date">
                            <input type="date" name="date" required />
                        </Field>
                        <Field label="Availability">
                            <select name="offered">
                                <option value="no">Closed / unavailable</option>
                                <option value="yes">Extra delivery date</option>
                            </select>
                        </Field>
                    </div>
                    <Button type="submit" disabled={mutation.busy}>
                        Save date exception
                    </Button>
                </form>
                {data.exceptions.map(e => (
                    <p key={`${e.zone_id}-${e.date}`}>
                        {data.catalog.zones.find(z => z.id === e.zone_id)?.name} · {e.date} ·{' '}
                        {e.offered ? 'Extra delivery' : 'Unavailable'}
                    </p>
                ))}
            </section>
        </div>
    );
}
export function PaymentSettings({ data, connected }: { data: VendorData; connected: boolean }) {
    const mutation = useMutation(connected);
    return (
        <div className="stack">
            <Notice>
                Payment preferences and instructions only. There is no bank connection, MCB Juice verification or real money
                movement.
            </Notice>
            {mutation.error && <Notice error>{mutation.error}</Notice>}
            {mutation.message && <Notice>{mutation.message}</Notice>}
            {data.catalog.payments.map(p => (
                <form
                    className="card stack"
                    key={p.method}
                    onSubmit={async e => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget);
                        await mutation.run(
                            'payment-setting',
                            { method: p.method, enabled: f.get('enabled') === 'on', instructions: String(f.get('instructions')) },
                            'Payment instructions saved.',
                        );
                    }}
                >
                    <h2>{paymentLabels[p.method].toUpperCase()}</h2>
                    <label className="check-row">
                        <input name="enabled" type="checkbox" defaultChecked={p.enabled} />
                        Offer this payment preference
                    </label>
                    <Field
                        label={`${paymentLabels[p.method]} instructions`}
                        hint="Use verified merchant details before real commerce. Demo values must remain clearly labelled."
                    >
                        <textarea name="instructions" rows={4} maxLength={1000} defaultValue={p.instructions} />
                    </Field>
                    <Button type="submit" disabled={mutation.busy}>
                        Save payment preference
                    </Button>
                </form>
            ))}
        </div>
    );
}
