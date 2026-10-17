'use client';
import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { lineInputSchema, requestSchema, type LineInput, type OrderRequest } from '@laviann/shared/domain';
const schema = z.object({
    version: z.literal(1),
    expires: z.number(),
    items: z.array(z.object({ id: z.uuid(), line: lineInputSchema })).max(30),
});
type Cart = z.infer<typeof schema>;
const empty: Cart = { version: 1, expires: 0, items: [] };
let cachedRaw: string | null = null;
let cached = empty;
let memoryOnly = false;
const listeners = new Set<() => void>();
function subscribe(fn: () => void) {
    listeners.add(fn);
    window.addEventListener('storage', fn);
    return () => {
        listeners.delete(fn);
        window.removeEventListener('storage', fn);
    };
}
function notify() {
    listeners.forEach(fn => fn());
}
function snapshot() {
    if (memoryOnly) return cached.expires > Date.now() ? cached : empty;
    let raw: string | null = null;
    try {
        raw = localStorage.getItem('laviann-cart-v1');
    } catch {
        return cached;
    }
    if (raw === cachedRaw && cached.expires > Date.now()) return cached;
    if (raw !== cachedRaw) {
        cachedRaw = raw;
        try {
            const parsed = schema.parse(JSON.parse(raw || 'null'));
            cached = parsed.expires > Date.now() ? parsed : empty;
        } catch {
            cached = empty;
        }
    }
    if (cached.expires <= Date.now()) cached = empty;
    return cached;
}
function save(items: Cart['items']) {
    cached = { version: 1, expires: Date.now() + 48 * 3600000, items };
    cachedRaw = JSON.stringify(cached);
    try {
        localStorage.setItem('laviann-cart-v1', cachedRaw);
    } catch {
        memoryOnly = true;
    }
    const existing = draftSnapshot();
    if (existing)
        saveDraft(items.length ? { ...existing, items: items.map(i => i.line), idempotency_key: crypto.randomUUID() } : null);
    notify();
}
export function useCart() {
    return useSyncExternalStore(subscribe, snapshot, () => empty);
}
export function addLine(line: LineInput, id?: string) {
    const old = snapshot();
    save(id ? old.items.map(i => (i.id === id ? { id, line } : i)) : [...old.items, { id: crypto.randomUUID(), line }]);
}
export function removeLine(id: string) {
    save(snapshot().items.filter(i => i.id !== id));
}
export function clearCart() {
    save([]);
}
let draftRaw: string | null = null;
let draft: OrderRequest | null = null;
let draftExpires = 0;
let draftMemoryOnly = false;
function draftSnapshot() {
    if (draftMemoryOnly) return draftExpires > Date.now() ? draft : null;
    let raw: string | null = null;
    try {
        raw = sessionStorage.getItem('laviann-request-v1');
    } catch {
        return draft;
    }
    if (raw !== draftRaw) {
        draftRaw = raw;
        try {
            const stored = z.object({ expires: z.number(), value: requestSchema }).parse(JSON.parse(raw || 'null'));
            draftExpires = stored.expires;
            draft = stored.expires > Date.now() ? stored.value : null;
        } catch {
            draft = null;
        }
    }
    if (draftExpires <= Date.now()) {
        draft = null;
        try {
            sessionStorage.removeItem('laviann-request-v1');
        } catch {
            /* Storage unavailable. */
        }
    }
    return draft;
}
export function useDraft() {
    return useSyncExternalStore(subscribe, draftSnapshot, () => null);
}
export function saveDraft(value: OrderRequest | null) {
    draft = value;
    draftExpires = value ? Date.now() + 86400000 : 0;
    draftRaw = value ? JSON.stringify({ expires: draftExpires, value }) : null;
    try {
        if (draftRaw) sessionStorage.setItem('laviann-request-v1', draftRaw);
        else sessionStorage.removeItem('laviann-request-v1');
    } catch {
        draftMemoryOnly = true;
    }
    notify();
}
