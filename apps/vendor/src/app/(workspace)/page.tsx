import Link from 'next/link';
import { isLowStock } from '@laviann/shared/domain';
import { Badge, Icon } from '@laviann/shared/ui';
import { loadVendor } from '../../lib/data';
import { OrderTable } from '../../components/orders';
export default async function Overview() {
    const data = await loadVendor();
    const counts = [
        ['New requests', data.orders.filter(o => o.status === 'pending_review').length, 'bag', '/orders'],
        [
            'Awaiting approval',
            data.orders.filter(o => o.status === 'awaiting_customer_confirmation').length,
            'calendar',
            '/orders',
        ],
        ['In preparation', data.orders.filter(o => ['confirmed', 'preparing'].includes(o.status)).length, 'cut', '/orders'],
        ['Ready for delivery', data.orders.filter(o => o.status === 'ready_for_delivery').length, 'truck', '/deliveries'],
    ] as const;
    const low = data.inventory.filter(isLowStock);
    return (
        <>
            <div className="page-heading">
                <div>
                    <span className="eyebrow">A clear view of your day</span>
                    <h1>GOOD THINGS ARE IN THE WORKS.</h1>
                    <p>Requests to review, portions to prepare, and deliveries to plan.</p>
                </div>
                <Link className="btn btn-primary" href="/orders/new">
                    ＋ Create manual order
                </Link>
            </div>
            <div className="metric-grid">
                {counts.map(([label, count, icon, href]) => (
                    <Link href={href} className="metric card" key={label}>
                        <div>
                            <span>{label}</span>
                            <Icon name={icon} />
                        </div>
                        <strong>{String(count).padStart(2, '0')}</strong>
                        <small>View queue →</small>
                    </Link>
                ))}
            </div>
            <div className="overview-grid">
                <section className="stack">
                    <div className="section-heading">
                        <h2>REQUESTS AT YOUR COUNTER</h2>
                        <Link className="link" href="/orders">
                            View all orders →
                        </Link>
                    </div>
                    <OrderTable
                        orders={data.orders
                            .filter(o => ['pending_review', 'awaiting_customer_confirmation'].includes(o.status))
                            .slice(0, 6)}
                    />
                    <section className="workflow-card">
                        <span className="eyebrow">The approval comes first</span>
                        <h2>
                            REVIEW. QUOTE.
                            <br />
                            THEN PREPARE.
                        </h2>
                        <p>A request doesn’t reserve stock. Customer approval of the latest quotation does.</p>
                        <Link className="btn btn-secondary" href="/orders">
                            Open the order queue →
                        </Link>
                    </section>
                </section>
                <aside className="stack">
                    <section className="card stack">
                        <div className="section-heading">
                            <h2>STOCK ATTENTION</h2>
                            <Badge tone="warm">{low.length}</Badge>
                        </div>
                        {low.length ? (
                            low.map(i => (
                                <Link href="/inventory" className="stock-alert" key={i.id}>
                                    <Icon name="box" />
                                    <div>
                                        <strong>{i.name}</strong>
                                        <p>
                                            {(i.on_hand_g - i.reserved_g) / 1000} kg available · {i.threshold_percent}% threshold
                                        </p>
                                    </div>
                                    <span>→</span>
                                </Link>
                            ))
                        ) : (
                            <p className="muted">All stock sources are above their warning thresholds.</p>
                        )}
                        <Link className="link" href="/inventory">
                            Manage inventory →
                        </Link>
                    </section>
                    <section className="card stack">
                        <h2>REGIONAL DELIVERY</h2>
                        {data.catalog.zones.map(z => (
                            <div className="zone-row" key={z.id}>
                                <span>{z.name}</span>
                                <strong>
                                    {z.weekdays.map(i => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]).join(', ') ||
                                        'No weekly dates'}
                                </strong>
                            </div>
                        ))}
                        <p className="muted">Sample schedule. Dates and cutoff rules are vendor-managed.</p>
                        <Link className="link" href="/settings/delivery">
                            Edit schedule →
                        </Link>
                    </section>
                </aside>
            </div>
        </>
    );
}
