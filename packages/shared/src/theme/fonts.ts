import { Big_Shoulders, Inter } from 'next/font/google';

// Next.js 16 exposes the variable Big Shoulders family (including optical sizing).
// Change font loaders here once; both application layouts consume these variables.
export const displayFont = Big_Shoulders({
    subsets: ['latin'],
    axes: ['opsz'],
    // Supply a manual fallback: Next.js has no automatic metrics for this family.
    fallback: ['Arial Narrow'],
    adjustFontFallback: false,
    variable: '--font-laviann-display',
    display: 'swap',
});

export const bodyFont = Inter({
    subsets: ['latin'],
    variable: '--font-laviann-body',
    display: 'swap',
});

export const fontVariables = `${displayFont.variable} ${bodyFont.variable}`;
