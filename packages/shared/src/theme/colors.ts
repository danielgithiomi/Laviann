// Approved forest-green palette. Both apps derive their CSS variables from here.
export const colors = {
    primary: '#12382F',
    primaryStrong: '#17483B',
    secondary: '#AFC799',
    secondaryPale: '#EBF1E8',
    background: '#F4F7F3',
    surface: '#FFFFFF',
    text: '#263D35',
    // Darkened after WCAG checks on ivory and pale sage surfaces.
    muted: '#52675D',
    border: '#DCE5DE',
    accent: '#C76B50',
    warningBackground: '#F9EBE4',
} as const;

export type ColorToken = keyof typeof colors;
