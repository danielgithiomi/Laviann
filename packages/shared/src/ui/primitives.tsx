import Image from 'next/image';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { formatMUR, statusLabels, weight, type LineSnapshot, type OrderStatus } from '../domain';
export function BrandLogo({ inverse = false, compact = false }: { inverse?: boolean; compact?: boolean }) {
    return (
        <Image
            className={compact ? 'brand-icon' : 'brand-logo'}
            src={`/assets/images/branding/${compact ? 'icon' : 'wordmark'}${inverse ? '-white' : ''}.svg`}
            width={compact ? 40 : 132}
            height={compact ? 40 : 44}
            alt="Laviann"
            priority
        />
    );
}
export function Button({
    children,
    className = '',
    variant = 'primary',
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'quiet' }) {
    return (
        <button type="button" className={`btn btn-${variant} ${className}`} {...props}>
            {children}
        </button>
    );
}
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
    return (
        <label className="field">
            <span>{label}</span>
            {children}
            {hint && <small>{hint}</small>}
        </label>
    );
}
export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
    return (
        <div className={`notice ${error ? 'notice-error' : ''}`} role={error ? 'alert' : 'status'}>
            {children}
        </div>
    );
}
export function Badge({ children, tone = '' }: { children: ReactNode; tone?: string }) {
    return <span className={`badge ${tone}`}>{children}</span>;
}
export function StatusBadge({ status }: { status: OrderStatus }) {
    return <Badge tone={status === 'pending_review' ? 'warm' : ''}>{statusLabels[status]}</Badge>;
}
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
    return (
        <div className="empty">
            <Icon name="bag" />
            <h2 className="font-display text-brand">{title}</h2>
            {children}
        </div>
    );
}
export function ProductArt({ slug, name, priority = false }: { slug: string; name: string; priority?: boolean }) {
    const known = [
        'whole-chicken',
        'chicken-breast',
        'chicken-drumsticks',
        'chicken-thighs',
        'chicken-wings',
        'beef-mince',
        'beef-cubes',
        'rump-steak',
        'hero',
    ];
    return (
        <Image
            className="product-art"
            src={`/assets/images/products/${known.includes(slug) ? slug : 'hero'}.svg`}
            width={560}
            height={400}
            alt={`Illustration of raw ${name.toLowerCase()}; product photo placeholder`}
            priority={priority}
        />
    );
}
export function PackageBreakdown({ line }: { line: LineSnapshot }) {
    return (
        <span>
            {line.package_count > 0 ? `${line.package_count} × ${weight(line.pack_g)}` : ''}
            {line.remainder_g > 0 ? `${line.package_count ? ' + ' : ''}1 × ${weight(line.remainder_g)}` : ''} · {line.cut}
        </span>
    );
}
export function OrderLines({ lines }: { lines: LineSnapshot[] }) {
    return (
        <div className="order-lines">
            {lines.map((line, i) => (
                <div className="order-line" key={`${line.product_id}-${i}`}>
                    <div>
                        <strong>{line.name}</strong>
                        <p>
                            {weight(line.grams)} · <PackageBreakdown line={line} />
                        </p>
                        <p>
                            {line.mode === 'pack'
                                ? `${line.pack_count} fixed packs at ${formatMUR(line.line_cents / line.pack_count)} / pack`
                                : `${formatMUR(line.unit_cents)} / kg`}
                        </p>
                        {line.note && <p className="line-note">“{line.note}”</p>}
                    </div>
                    <strong>{formatMUR(line.line_cents)}</strong>
                </div>
            ))}
        </div>
    );
}
export function Totals({ subtotal, fee, label = 'Estimated total' }: { subtotal: number; fee: number; label?: string }) {
    return (
        <dl className="totals">
            <div>
                <dt>Products</dt>
                <dd>{formatMUR(subtotal)}</dd>
            </div>
            <div>
                <dt>Packaging</dt>
                <dd>{formatMUR(0)}</dd>
            </div>
            <div>
                <dt>Delivery</dt>
                <dd>{formatMUR(fee)}</dd>
            </div>
            <div className="grand-total">
                <dt>{label}</dt>
                <dd>{formatMUR(subtotal + fee)}</dd>
            </div>
        </dl>
    );
}
export function Timeline({ status }: { status: OrderStatus }) {
    const steps: OrderStatus[] = [
        'pending_review',
        'awaiting_customer_confirmation',
        'confirmed',
        'preparing',
        'ready_for_delivery',
        'out_for_delivery',
        'delivered',
    ];
    const current = steps.indexOf(status);
    return (
        <ol className="timeline" aria-label="Order progress">
            {steps.map((s, i) => (
                <li key={s} className={i <= current ? 'reached' : ''} aria-current={s === status ? 'step' : undefined}>
                    <span aria-hidden="true">{i < current ? '✓' : i + 1}</span>
                    {statusLabels[s]}
                    {s === status && <strong>Current</strong>}
                </li>
            ))}
        </ol>
    );
}
export function Icon({ name, size = 22 }: { name: string; size?: number }) {
    const paths: Record<string, ReactNode> = {
        bag: (
            <>
                <path d="M5 7h14l1 14H4L5 7Z" />
                <path d="M8 7V5a4 4 0 0 1 8 0v2" />
            </>
        ),
        arrow: (
            <>
                <path d="M4 12h16m-6-6 6 6-6 6" />
            </>
        ),
        search: (
            <>
                <circle cx="10" cy="10" r="6" />
                <path d="m15 15 6 6" />
            </>
        ),
        truck: (
            <>
                <path d="M2 5h12v12H2zm12 4h4l4 5v3h-8" />
                <circle cx="6" cy="18" r="2" />
                <circle cx="18" cy="18" r="2" />
            </>
        ),
        grid: (
            <>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </>
        ),
        box: (
            <>
                <path d="m3 7 9-4 9 4v11l-9 4-9-4V7Zm0 0 9 4 9-4m-9 4v11m-5-17 9 4" />
            </>
        ),
        calendar: (
            <>
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M7 2v6m10-6v6M3 11h18" />
            </>
        ),
        check: <path d="m4 12 5 5L20 6" />,
        pin: (
            <>
                <path d="M19 9c0 5-7 13-7 13S5 14 5 9a7 7 0 1 1 14 0Z" />
                <circle cx="12" cy="9" r="2" />
            </>
        ),
        money: (
            <>
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <circle cx="12" cy="12" r="3" />
            </>
        ),
        cut: (
            <>
                <path d="M5 18c-5-6 3-14 10-15s8 6 3 11-10 10-13 4Z" />
                <path d="m10 13 5-5" />
            </>
        ),
    };
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {paths[name] || paths.grid}
        </svg>
    );
}
