'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { BrandLogo, Button, Icon, Notice, postJson } from '@laviann/shared/ui';
const links = [
    ['/', 'Overview', 'grid'],
    ['/orders', 'Orders', 'bag'],
    ['/products', 'Products', 'cut'],
    ['/inventory', 'Inventory', 'box'],
    ['/deliveries', 'Deliveries', 'truck'],
    ['/settings/delivery', 'Delivery settings', 'calendar'],
    ['/settings/payments', 'Payment settings', 'money'],
];
export function Sidebar({ pending }: { pending: number }) {
    const path = usePathname();
    return (
        <aside className="vendor-sidebar">
            <Link href="/" className="sidebar-logo">
                <BrandLogo inverse />
                <span>VENDOR WORKSPACE</span>
            </Link>
            <nav aria-label="Vendor navigation">
                {links.map(([href = '/', label, icon = 'grid']) => (
                    <Link
                        href={href}
                        key={href}
                        aria-current={
                            href === '/' ? (path === '/' ? 'page' : undefined) : path.startsWith(href) ? 'page' : undefined
                        }
                    >
                        <Icon name={icon} size={19} />
                        <span>{label}</span>
                        {href === '/orders' && pending > 0 && <b>{pending}</b>}
                    </Link>
                ))}
            </nav>
            <div className="sidebar-bottom">
                <BrandLogo compact inverse />
                <p>
                    Quality Meats,
                    <br />
                    Greater Meals.
                </p>
                <small>Single-vendor POC · Mauritius</small>
            </div>
        </aside>
    );
}
export function Topbar({ connected }: { connected: boolean }) {
    const router = useRouter();
    const [error, setError] = useState('');
    return (
        <>
            <header className="vendor-topbar">
                <span>YOUR COUNTER, CONNECTED.</span>
                <div className="actions">
                    <Link href="/orders/new" className="btn btn-secondary">
                        ＋ Manual order
                    </Link>
                    <span className="avatar" aria-hidden="true">
                        V
                    </span>
                    <strong>Vendor owner</strong>
                    {connected && (
                        <Button
                            variant="quiet"
                            onClick={async () => {
                                try {
                                    await postJson('/api/logout', {});
                                    router.push('/login');
                                    router.refresh();
                                } catch {
                                    setError('Sign out could not be confirmed. Please retry.');
                                }
                            }}
                        >
                            Sign out
                        </Button>
                    )}
                </div>
            </header>
            {error && <Notice error>{error}</Notice>}
        </>
    );
}
