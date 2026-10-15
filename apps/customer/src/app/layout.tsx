import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { themeVariables } from '@laviann/shared/theme';
import '@laviann/shared/theme.css';
import './globals.css';

export const metadata: Metadata = {
    title: 'Laviann | Customer storefront',
    description: 'Mobile-first ordering website for Mauritius.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" style={themeVariables}>
            <body>{children}</body>
        </html>
    );
}
