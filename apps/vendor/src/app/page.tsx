const modules = ['Orders and quotations', 'Products and stock', 'Delivery zones and schedules', 'Payment records'];

export default function HomePage() {
    return (
        <main className="shell">
            <header className="masthead">
                <strong>LAVIANN</strong>
                <span>Vendor workspace</span>
            </header>
            <section className="intro">
                <span className="eyebrow">One place for the vendor&apos;s day-to-day work</span>
                <h1>Orders, inventory and delivery - organized.</h1>
                <p>
                    The vendor application has been scaffolded. Authentication and operational screens will be implemented after
                    UX planning. No order or customer data is connected yet.
                </p>
            </section>
            <section className="panel" aria-labelledby="planned-modules">
                <h2 id="planned-modules">Planned dashboard modules</h2>
                <ul>
                    {modules.map(module => (
                        <li key={module}>{module}</li>
                    ))}
                </ul>
            </section>
            <footer>Scaffold only - protected vendor routes must be implemented before launch.</footer>
        </main>
    );
}
