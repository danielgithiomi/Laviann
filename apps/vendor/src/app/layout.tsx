import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { themeVariables } from '@laviann/shared/theme';
import { fontVariables } from '@laviann/shared/fonts';
import './globals.css';

export const metadata: Metadata = {
    title: 'LAVIANN · Vendor workspace',
    description: 'Single-vendor order, stock and delivery workspace.',
    icons: {
        icon: [
            {
                url: '/assets/images/branding/icon.svg',
                media: '(prefers-color-scheme:light)',
            },
            {
                url: '/assets/images/branding/icon-white.svg',
                media: '(prefers-color-scheme:dark)',
            },
        ],
    },
    robots: { index: false, follow: false },
    referrer: 'no-referrer',
};
export default async function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" className={fontVariables} style={themeVariables}>
            <body>
                <a href="#main" className="skip-link">
                    Skip to content
                </a>
                {children}
            </body>
        </html>
    );
}
