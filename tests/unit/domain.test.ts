import { describe, expect, test } from 'bun:test';
import { demoCatalog } from '../../packages/shared/src/domain/demo';
import {
    formatMUR,
    isLowStock,
    nextStatuses,
    offeredDates,
    packagePlan,
    priceLine,
    quoteChanges,
    requestSchema,
} from '../../packages/shared/src/domain';
const catalog = demoCatalog(new Date('2026-10-16T08:00:00Z'));
const breast = catalog.products[1]!;
const line = {
    product_id: breast.id,
    grams: 2000,
    cut: 'as supplied',
    pack_g: 500,
    note: '',
    mode: 'weight' as const,
    pack_id: '',
    pack_count: 1,
};
describe('PRD money, customization and schedules', () => {
    test('six kilograms, twelve packs, North total Rs 2,095', () => {
        const lines = [1, 2, 4].map(i => priceLine(catalog.products[i]!, { ...line, product_id: catalog.products[i]!.id }));
        expect(lines.reduce((n, l) => n + l.package_count, 0)).toBe(12);
        expect(lines.reduce((n, l) => n + l.line_cents, 0)).toBe(197000);
        expect(formatMUR(197000 + catalog.zones[1]!.fee_cents)).toBe('Rs 2,095');
    });
    test('portion validation and permitted remainders', () => {
        expect(packagePlan(2000, 500, false)).toEqual({ count: 4, remainder_g: 0 });
        expect(() => packagePlan(2500, 1000, false)).toThrow();
        expect(packagePlan(2500, 1000, true)).toEqual({ count: 2, remainder_g: 500 });
        expect(() => packagePlan(0.5, 0, true)).toThrow();
    });
    test('invalid cuts, steps, disabled and insufficient-stock products fail', () => {
        expect(() => priceLine(breast, { ...line, cut: 'invented' })).toThrow();
        expect(() => priceLine(breast, { ...line, grams: 501 })).toThrow();
        expect(() => priceLine({ ...breast, active: false }, line)).toThrow();
        expect(() => priceLine({ ...breast, available_g: 500 }, line)).toThrow();
    });
    test('fixed packs use configured pack price and exact count', () => {
        const product = { ...breast, fixed_packs: [{ id: '500g', grams: 500, price_cents: 20000 }] };
        expect(priceLine(product, { ...line, mode: 'pack', pack_id: '500g', pack_count: 4 }).line_cents).toBe(80000);
        expect(() => priceLine(product, { ...line, mode: 'pack', pack_id: '500g', pack_count: 3 })).toThrow();
    });
    test('integer-cent rounding and half kilo display', () => {
        expect(priceLine(breast, { ...line, grams: 500 }).line_cents).toBe(23750);
        expect(formatMUR(23750)).toBe('Rs 237.50');
    });
    test('North only Thursday, Mauritius prior-day 16:00 cutoff, exceptions', () => {
        const north = catalog.zones[1]!;
        const before = offeredDates(north, new Date('2026-10-21T11:59:59Z'));
        const after = offeredDates(north, new Date('2026-10-21T12:00:00Z'));
        expect(before).toContain('2026-10-22');
        expect(after).not.toContain('2026-10-22');
        expect(after.every(d => new Date(d).getUTCDay() === 4)).toBe(true);
        expect(offeredDates(north, new Date('2026-10-20T08:00:00Z'), [{ date: '2026-10-22', offered: false }])).not.toContain(
            '2026-10-22',
        );
    });
    test('low-stock boundary and irreversible fulfillment', () => {
        const stock = {
            id: breast.stock_id,
            name: breast.name,
            on_hand_g: 7000,
            reserved_g: 2000,
            target_g: 50000,
            threshold_percent: 10,
        };
        expect(isLowStock(stock)).toBe(true);
        expect(isLowStock({ ...stock, on_hand_g: 7001 })).toBe(false);
        expect(nextStatuses('delivered')).toEqual([]);
        expect(nextStatuses('confirmed')).toContain('preparing');
    });
    test('malformed customer details and trusted-total injection fail', () => {
        expect(requestSchema.safeParse({ total_cents: 1, items: [line] }).success).toBe(false);
    });
});

test('quotation comparison preserves duplicate lines and highlights exact changed terms', () => {
    const priced = priceLine(breast, line);
    const original = {
        items: [priced, priced],
        subtotal_cents: 190000,
        fee_cents: 12500,
        total_cents: 202500,
        zone_id: catalog.zones[1]!.id,
        zone_name: 'North',
        date: '2026-10-22',
    };
    expect(quoteChanges(original, original)).toEqual([]);
    const changes = quoteChanges(original, { ...original, items: [priced], total_cents: 107500, date: '2026-10-29' });
    expect(changes.filter(c => c.startsWith('Originally'))).toHaveLength(1);
    expect(changes).toContain('Delivery: North, 2026-10-22 → North, 2026-10-29');
    expect(changes).toContain('Total: Rs 2,025 → Rs 1,075');
});
