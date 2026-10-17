import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { themeVariables } from '@laviann/shared/theme';
import { fontVariables } from '@laviann/shared/fonts';
import { BrandLogo } from '@laviann/shared/ui';
import { configured } from '@laviann/shared/server';
import { Header } from '../components/header';
import './globals.css';
export const metadata: Metadata = {
    title: 'LAVIANN · Quality Meats, Greater Meals.',
    description: 'Raw chicken and beef, cut and portioned your way. Request an order for your regional delivery day.',
    icons: { icon: '/assets/images/branding/favicon.svg' },
    referrer: 'no-referrer',
    robots: { index: false, follow: false },
};
export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" className={fontVariables} style={themeVariables}>
            <body>
                <a className="skip-link" href="#main">
                    Skip to content
                </a>
                <div className="demo-bar">
                    {configured()
                        ? 'Laviann proof of concept · Sample prices & schedules · No real payments'
                        : 'Demo preview · Sample data · Requests are not saved until Supabase is configured'}
                </div>
                <Header />
                <main id="main" className="shell store-main">
                    {children}
                </main>
                <footer className="store-footer">
                    <div className="shell footer-inner">
                        <div>
                            <BrandLogo />
                            <p>Quality Meats, Greater Meals.</p>
                        </div>
                        <p>
                            One vendor. Thoughtful portions.
                            <br />
                            Delivery on your regional day.
                        </p>
                        <div>
                            <Link href="/shop">Explore the cuts</Link>
                            <Link href="/#how-it-works">How ordering works</Link>
                        </div>
                        <small>
                            A Mauritius ordering proof of concept.
                            <br />
                            Illustrations and prices are demonstration material.
                        </small>
                    </div>
                </footer>
            </body>
        </html>
    );
}
