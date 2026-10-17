import { colors } from './colors';
import { typography } from './typography';
import type { ThemeVariables } from '../types';

export { typography } from './typography';
export { colors, type ColorToken } from './colors';

export const themeVariables: ThemeVariables = {
    '--laviann-primary': colors.primary,
    '--laviann-primary-strong': colors.primaryStrong,
    '--laviann-secondary': colors.secondary,
    '--laviann-secondary-pale': colors.secondaryPale,
    '--laviann-background': colors.background,
    '--laviann-surface': colors.surface,
    '--laviann-text': colors.text,
    '--laviann-muted': colors.muted,
    '--laviann-border': colors.border,
    '--laviann-accent': colors.accent,
    '--laviann-warning-background': colors.warningBackground,
    '--laviann-font-body': typography.body,
    '--laviann-font-heading': typography.heading,
    '--laviann-radius-control': '14px',
    '--laviann-radius-card': '18px',
    '--laviann-radius-pill': '999px',
};
