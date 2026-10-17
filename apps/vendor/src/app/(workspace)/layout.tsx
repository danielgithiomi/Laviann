import type { ReactNode } from 'react';
import { configured } from '@laviann/shared/server';
import { loadVendor } from '../../lib/data';
import { Sidebar, Topbar } from '../../components/shell';
export const dynamic = 'force-dynamic';
export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
    const data = await loadVendor();
    const connected = configured();
    return (
        <div className="vendor-shell">
            <Sidebar pending={data.orders.filter(o => o.status === 'pending_review').length} />
            <div className="vendor-content">
                <Topbar connected={connected} />
                <div className="demo-bar">
                    {connected
                        ? 'POC workspace · Demo prices and sample inventory · Manual payments'
                        : 'Read-only demo preview · No authentication or saved mutations in this mode'}
                </div>
                <main id="main" className="vendor-main">
                    {children}
                </main>
                <footer className="vendor-footer">
                    LAVIANN · Quality Meats, Greater Meals. <span>Indian/Mauritius · UTC+4</span>
                </footer>
            </div>
        </div>
    );
}
