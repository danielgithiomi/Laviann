import type { CSSProperties, ReactNode } from 'react';

export type ThemeVariables = CSSProperties & {
    [token: `--laviann-${string}`]: string;
};

export interface PageShellProps {
    label: string;
    footer: string;
    children: ReactNode;
}
