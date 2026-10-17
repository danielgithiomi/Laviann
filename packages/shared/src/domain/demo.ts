import { catalogSchema, offeredDates, type Catalog, type VendorData } from './index';

export const demoId = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const rows: [string, string, number, number][] = [
    ['whole-chicken', 'Whole chicken', 23500, 1],
    ['chicken-breast', 'Chicken breast', 47500, 1],
    ['chicken-drumsticks', 'Chicken drumsticks', 29000, 1],
    ['chicken-thighs', 'Chicken thighs', 35000, 1],
    ['chicken-wings', 'Chicken wings', 22000, 1],
    ['beef-mince', 'Beef mince', 83000, 2],
    ['beef-cubes', 'Beef cubes', 83000, 2],
    ['rump-steak', 'Rump steak', 110000, 2],
];
export function demoCatalog(now = new Date()): Catalog {
    const catalog = catalogSchema.parse({
        demo: true,
        categories: [
            { id: demoId(1), name: 'Chicken', slug: 'chicken', active: true },
            { id: demoId(2), name: 'Beef', slug: 'beef', active: true },
        ],
        products: rows.map(([slug, name, price, category], i) => ({
            id: demoId(10 + i),
            stock_id: demoId(100 + i),
            category_id: demoId(category),
            slug,
            name,
            description:
                category === 1
                    ? 'Raw chicken, portioned to your plans. Choose your weight and how you would like it packed.'
                    : 'Raw beef for your next meal. Choose your weight, cut and portions for vendor review.',
            price_cents: price,
            min_g: 500,
            step_g: 250,
            cuts: slug === 'whole-chicken' ? ['whole', 'curry pieces'] : ['as supplied', 'small pieces'],
            pack_sizes_g: [500, 1000],
            allow_remainder: false,
            fixed_packs: [
                { id: '500g', grams: 500, price_cents: price / 2 },
                { id: '1kg', grams: 1000, price_cents: price },
            ],
            active: true,
            available_g: i === 4 ? 5000 : 50000,
        })),
        zones: ['Central', 'North', 'West', 'East', 'South'].map((name, i) => ({
            id: demoId(200 + i),
            name,
            fee_cents: [7500, 12500, 15000, 17500, 22500][i],
            weekdays: [[1], [4], [2], [3], [5]][i],
            cutoff_time: '16:00:00',
            cutoff_days: 1,
            guidance: 'Demo coverage. Confirm your locality with the vendor.',
            active: true,
        })),
        offers: [],
        payments: ['cash_on_delivery', 'mcb_juice', 'bank_transfer'].map(method => ({
            method,
            enabled: true,
            instructions: 'Demo only. The vendor will provide verified payment instructions with your quotation.',
        })),
    });
    catalog.offers = catalog.zones.flatMap(zone => offeredDates(zone, now).map(date => ({ zone_id: zone.id, date })));
    return catalog;
}
export function demoVendorData(): VendorData {
    const catalog = demoCatalog();
    return {
        catalog,
        orders: [],
        movements: [],
        exceptions: [],
        inventory: catalog.products.map(p => ({
            id: p.stock_id,
            name: p.name,
            on_hand_g: p.available_g,
            reserved_g: 0,
            target_g: 50000,
            threshold_percent: 10,
        })),
    };
}
