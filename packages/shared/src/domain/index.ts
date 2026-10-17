import { z } from 'zod';

export const orderStatuses = [
    'pending_review',
    'awaiting_customer_confirmation',
    'confirmed',
    'preparing',
    'ready_for_delivery',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'rejected',
] as const;
export const paymentMethods = ['cash_on_delivery', 'mcb_juice', 'bank_transfer'] as const;
export const paymentStatuses = ['unpaid', 'payment_reported', 'paid', 'refunded', 'failed'] as const;
export const statusLabels: Record<OrderStatus, string> = {
    pending_review: 'Pending Review',
    awaiting_customer_confirmation: 'Awaiting Customer Confirmation',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready_for_delivery: 'Ready for Delivery',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
};
export const paymentLabels = { cash_on_delivery: 'Cash on delivery', mcb_juice: 'MCB Juice', bank_transfer: 'Bank transfer' };
export type OrderStatus = (typeof orderStatuses)[number];
export type PaymentMethod = (typeof paymentMethods)[number];
export type PaymentStatus = (typeof paymentStatuses)[number];
const money = z.number().int().min(0).max(100_000_000);
const grams = z.number().int().min(1).max(1_000_000);
const text = (max: number) => z.string().trim().max(max);
export const uuid = z.uuid();
export const dateSchema = z.iso.date();
export const contactSchema = z.object({
    name: text(100).min(2),
    phone: text(24).regex(/^\+?[\d ()-]{7,24}$/, 'Enter a valid phone number.'),
    locality: text(100).min(2),
    address: text(500).min(5),
});
export const fixedPackSchema = z.object({ id: text(40).min(1), grams, price_cents: money });
export const productSchema = z.object({
    id: uuid,
    category_id: uuid,
    stock_id: uuid,
    slug: text(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: text(100).min(2),
    description: text(600),
    price_cents: money,
    min_g: grams,
    step_g: grams,
    cuts: z.array(text(50).min(1)).min(1).max(12),
    pack_sizes_g: z.array(grams).min(1).max(12),
    allow_remainder: z.boolean(),
    fixed_packs: z.array(fixedPackSchema).max(12),
    active: z.boolean(),
    available_g: z.number().int().min(0),
});
export const categorySchema = z.object({ id: uuid, name: text(60).min(2), slug: text(80), active: z.boolean() });
export const zoneSchema = z.object({
    id: uuid,
    name: text(60),
    fee_cents: money,
    weekdays: z.array(z.number().int().min(0).max(6)).max(7),
    cutoff_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
    cutoff_days: z.number().int().min(0).max(14),
    guidance: text(300),
    active: z.boolean(),
});
export const paymentSettingSchema = z.object({ method: z.enum(paymentMethods), enabled: z.boolean(), instructions: text(1000) });
export const catalogSchema = z.object({
    demo: z.boolean(),
    products: z.array(productSchema),
    categories: z.array(categorySchema),
    zones: z.array(zoneSchema),
    offers: z.array(z.object({ zone_id: uuid, date: dateSchema })),
    payments: z.array(paymentSettingSchema),
});
export const lineInputSchema = z.object({
    product_id: uuid,
    grams,
    cut: text(50).min(1),
    pack_g: grams,
    note: text(500).default(''),
    mode: z.enum(['weight', 'pack']).default('weight'),
    pack_id: text(40).default(''),
    pack_count: z.number().int().min(1).max(1000).default(1),
});
export const requestSchema = z
    .object({
        idempotency_key: uuid,
        contact: contactSchema,
        zone_id: uuid,
        date: dateSchema,
        payment_method: z.enum(paymentMethods),
        items: z.array(lineInputSchema).min(1).max(30),
    })
    .strict();
export const lineSnapshotSchema = lineInputSchema.extend({
    stock_id: uuid,
    name: z.string(),
    unit_cents: money,
    line_cents: money,
    package_count: z.number().int().min(0),
    remainder_g: z.number().int().min(0),
});
export const estimateSchema = z.object({
    items: z.array(lineSnapshotSchema),
    subtotal_cents: money,
    fee_cents: money,
    total_cents: money,
    zone_id: uuid,
    zone_name: z.string(),
    date: dateSchema,
});
export const quoteSchema = estimateSchema.extend({
    id: uuid,
    version: z.number().int(),
    status: z.enum(['issued', 'superseded', 'approved', 'void']),
    expires_at: z.string(),
    issued_at: z.string(),
    note: z.string(),
    approved_at: z.string().nullable(),
});
export const eventSchema = z.object({ id: uuid, kind: z.string(), note: z.string(), created_at: z.string() });
export const orderSchema = z.object({
    id: uuid,
    reference: z.string(),
    status: z.enum(orderStatuses),
    origin: z.enum(['website', 'vendor_entered']),
    request: requestSchema,
    estimate: estimateSchema,
    payment_status: z.enum(paymentStatuses),
    created_at: z.string(),
    quotes: z.array(quoteSchema),
    events: z.array(eventSchema),
});
export const guestOrderSchema = orderSchema.omit({ request: true }).extend({
    payment_method: z.enum(paymentMethods),
    payment_instructions: z.string(),
    can_approve: z.boolean(),
});
export const inventorySchema = z.object({
    id: uuid,
    name: z.string(),
    on_hand_g: z.number().int(),
    reserved_g: z.number().int(),
    target_g: grams,
    threshold_percent: z.number().int().min(1).max(100),
});
export const movementSchema = z.object({
    id: uuid,
    stock_id: uuid,
    kind: z.string(),
    on_hand_delta: z.number(),
    reserved_delta: z.number(),
    reason: z.string(),
    created_at: z.string(),
});
export const vendorDataSchema = z.object({
    catalog: catalogSchema,
    orders: z.array(orderSchema),
    inventory: z.array(inventorySchema),
    movements: z.array(movementSchema),
    exceptions: z.array(z.object({ zone_id: uuid, date: dateSchema, offered: z.boolean() })),
});
export const quoteInputSchema = z.object({
    order_id: uuid,
    operation_key: uuid,
    expected_version: z.number().int().min(0),
    items: z.array(lineInputSchema).min(1).max(30),
    zone_id: uuid,
    date: dateSchema,
    note: text(1000),
    expires_hours: z.number().int().min(1).max(168),
});
export const stockInputSchema = z.object({
    stock_id: uuid,
    operation_key: uuid,
    delta_g: z.number().int().min(-1_000_000).max(1_000_000),
    target_g: grams,
    threshold_percent: z.number().int().min(1).max(100),
    reason: text(500).min(3),
});
export const transitionSchema = z.object({ order_id: uuid, status: z.enum(orderStatuses), reason: text(500).default('') });
export const paymentInputSchema = z.object({
    order_id: uuid,
    operation_key: uuid,
    status: z.enum(paymentStatuses),
    reference: text(200).min(3),
});
export type Catalog = z.infer<typeof catalogSchema>;
export type Product = z.infer<typeof productSchema>;
export type Zone = z.infer<typeof zoneSchema>;
export type LineInput = z.infer<typeof lineInputSchema>;
export type LineSnapshot = z.infer<typeof lineSnapshotSchema>;
export type OrderRequest = z.infer<typeof requestSchema>;
export type Order = z.infer<typeof orderSchema>;
export type GuestOrder = z.infer<typeof guestOrderSchema>;
export type Quote = z.infer<typeof quoteSchema>;
export type VendorData = z.infer<typeof vendorDataSchema>;

export function formatMUR(cents: number): string {
    return `Rs ${(cents / 100).toLocaleString('en-MU', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
}
export function weight(g: number): string {
    return g < 1000 ? `${g} g` : `${g / 1000} kg`;
}
export function packagePlan(g: number, pack: number, remainder: boolean) {
    if (!Number.isSafeInteger(g) || !Number.isSafeInteger(pack) || g < 1 || pack < 1)
        throw new Error('Choose a valid weight and portion.');
    if (g % pack && !remainder) throw new Error('Choose a weight that divides evenly into your portions.');
    return { count: Math.floor(g / pack), remainder_g: g % pack };
}
export function priceLine(product: Product, line: LineInput): LineSnapshot {
    lineInputSchema.parse(line);
    if (!product.active || product.available_g < line.grams)
        throw new Error('This quantity is currently unavailable. Ask the vendor to review it.');
    if (!product.cuts.includes(line.cut) || !product.pack_sizes_g.includes(line.pack_g))
        throw new Error('Choose one of this product’s offered cuts and portions.');
    let amount: number;
    if (line.mode === 'pack') {
        const pack = product.fixed_packs.find(p => p.id === line.pack_id);
        if (!pack || line.grams !== pack.grams * line.pack_count) throw new Error('Choose a valid fixed pack and count.');
        amount = pack.price_cents * line.pack_count;
    } else {
        if (line.grams < product.min_g || line.grams % product.step_g !== 0)
            throw new Error(`Choose at least ${weight(product.min_g)} in ${weight(product.step_g)} steps.`);
        amount = Math.floor((product.price_cents * line.grams + 500) / 1000);
    }
    const plan = packagePlan(line.grams, line.pack_g, product.allow_remainder);
    return {
        ...line,
        stock_id: product.stock_id,
        name: product.name,
        unit_cents: product.price_cents,
        line_cents: amount,
        package_count: plan.count,
        remainder_g: plan.remainder_g,
    };
}
export function isLowStock(item: z.infer<typeof inventorySchema>): boolean {
    return (item.on_hand_g - item.reserved_g) * 100 <= item.target_g * item.threshold_percent;
}
export function nextStatuses(status: OrderStatus): OrderStatus[] {
    const paths: Record<OrderStatus, OrderStatus[]> = {
        pending_review: ['rejected', 'cancelled'],
        awaiting_customer_confirmation: ['rejected', 'cancelled'],
        confirmed: ['preparing', 'cancelled'],
        preparing: ['ready_for_delivery', 'cancelled'],
        ready_for_delivery: ['out_for_delivery', 'cancelled'],
        out_for_delivery: ['delivered', 'cancelled'],
        delivered: [],
        cancelled: [],
        rejected: [],
    };
    return paths[status];
}
export function offeredDates(zone: Zone, now = new Date(), exceptions: { date: string; offered: boolean }[] = []): string[] {
    const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Indian/Mauritius',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(now);
    const dates: string[] = [];
    if (!zone.active) return dates;
    for (let i = 0; i < 29; i++) {
        const day = new Date(`${today}T00:00:00Z`);
        day.setUTCDate(day.getUTCDate() + i);
        const date = day.toISOString().slice(0, 10);
        const override = exceptions.find(e => e.date === date);
        const cutoff = new Date(`${date}T${zone.cutoff_time.slice(0, 5)}:00+04:00`);
        cutoff.setUTCDate(cutoff.getUTCDate() - zone.cutoff_days);
        if ((override?.offered ?? zone.weekdays.includes(day.getUTCDay())) && now < cutoff) dates.push(date);
    }
    return dates;
}

/** Compare the reviewed terms with the immutable request estimate, including duplicate lines. */
export function quoteChanges(original: z.infer<typeof estimateSchema>, reviewed: z.infer<typeof estimateSchema>): string[] {
    const describe = (l: LineSnapshot) =>
        `${l.name}: ${weight(l.grams)}, ${l.cut}, ${weight(l.pack_g)} portions, ${formatMUR(l.line_cents)}${l.note ? `; ${l.note}` : ''}`;
    const remaining = [...original.items];
    const added: string[] = [];
    for (const line of reviewed.items) {
        const index = remaining.findIndex(
            old =>
                old.product_id === line.product_id &&
                describe(old) === describe(line) &&
                old.mode === line.mode &&
                old.pack_id === line.pack_id,
        );
        if (index < 0) added.push(`Reviewed — ${describe(line)}`);
        else remaining.splice(index, 1);
    }
    const changes = [...remaining.map(l => `Originally — ${describe(l)}`), ...added];
    if (original.zone_id !== reviewed.zone_id || original.date !== reviewed.date)
        changes.push(`Delivery: ${original.zone_name}, ${original.date} → ${reviewed.zone_name}, ${reviewed.date}`);
    if (original.fee_cents !== reviewed.fee_cents)
        changes.push(`Delivery fee: ${formatMUR(original.fee_cents)} → ${formatMUR(reviewed.fee_cents)}`);
    if (original.total_cents !== reviewed.total_cents)
        changes.push(`Total: ${formatMUR(original.total_cents)} → ${formatMUR(reviewed.total_cents)}`);
    return changes;
}
