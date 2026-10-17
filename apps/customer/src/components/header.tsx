'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo, Icon } from '@laviann/shared/ui';
import { useCart } from './cart-store';
export function Header() {
    const cart = useCart();
    const path = usePathname();
    return (
        <header className="store-header">
            <div className="shell header-inner">
                <Link href="/" aria-label="Laviann home">
                    <BrandLogo />
                </Link>
                <nav aria-label="Main navigation">
                    <Link aria-current={path === '/shop' ? 'page' : undefined} href="/shop">
                        Shop all cuts
                    </Link>
                    <Link className="desktop-nav" href="/category/chicken">
                        Chicken
                    </Link>
                    <Link className="desktop-nav" href="/category/beef">
                        Beef
                    </Link>
                    <Link className="desktop-nav" href="/#how-it-works">
                        How it works
                    </Link>
                </nav>
                <Link href="/cart" className="cart-link" aria-label={`Cart, ${cart.items.length} items`}>
                    <Icon name="bag" />
                    <span>{cart.items.length}</span>
                </Link>
            </div>
        </header>
    );
}
