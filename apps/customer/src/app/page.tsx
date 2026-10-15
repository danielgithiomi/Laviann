const features = [
    'Browse raw chicken and beef cuts',
    'Choose weights and packaging instructions',
    'Request delivery on vendor-set zone dates',
    'Review a quotation before confirmation',
];

export default function HomePage() {
    return (
        <main className="shell">
            <header className="masthead">
                <strong>LAVIANN</strong>
                <span>Customer storefront</span>
            </header>
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
            <footer>Scaffold only - sample application, not a live ordering service.</footer>
        </main>
    );
}
