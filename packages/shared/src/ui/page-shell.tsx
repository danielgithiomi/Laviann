import type { PageShellProps } from '../types';

// Shared framing for the existing scaffold; page content stays in each app.
export function PageShell({ label, footer, children }: PageShellProps) {
    return (
        <main className="shell">
            <header className="masthead">
                <strong>LAVIANN</strong>
                <span>{label}</span>
            </header>
            {children}
            <footer>{footer}</footer>
        </main>
    );
}
