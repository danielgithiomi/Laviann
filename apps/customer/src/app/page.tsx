import { PageShell } from '@laviann/shared/ui';

const features = [
    'Browse raw chicken and beef cuts',
    'Choose weights and packaging instructions',
    'Request delivery on vendor-set zone dates',
    'Review a quotation before confirmation',
];

export default function HomePage() {
    return (
        <PageShell label="Customer storefront" footer="Scaffold only - sample application, not a live ordering service.">
            <section className="intro">
                <span className="eyebrow">A better way to order raw meat</span>
                <h1>Fresh choices. Clear orders. Planned delivery.</h1>
                <p>
                    This is the foundation for Laviann&apos;s mobile-first customer ordering experience. The catalogue and
                    checkout workflows will be built during the implementation phase.
                </p>
            </section>
            <section className="panel" aria-labelledby="planned-features">
                <h2 id="planned-features">Planned customer journey</h2>
                <ul>
                    {features.map(feature => (
                        <li key={feature}>{feature}</li>
                    ))}
                </ul>
            </section>
        </PageShell>
    );
}
