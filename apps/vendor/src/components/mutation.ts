'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { postJson } from '@laviann/shared/ui';
export function useMutation(connected: boolean) {
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const operation = useRef({ fingerprint: '', key: '' });
    function keyFor(input: unknown) {
        const fingerprint = JSON.stringify(input);
        if (operation.current.fingerprint !== fingerprint) operation.current = { fingerprint, key: crypto.randomUUID() };
        return operation.current.key;
    }
    async function run(action: string, input: unknown, success = 'Saved.') {
        setError('');
        setMessage('');
        if (!connected) {
            setError('Preview only. Connect Supabase and sign in to save changes.');
            return null;
        }
        setBusy(true);
        try {
            const result = await postJson('/api/operations', { action, input });
            operation.current = { fingerprint: '', key: '' };
            setMessage(success);
            router.refresh();
            return result;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'The change was not confirmed. Retry safely.');
            return null;
        } finally {
            setBusy(false);
        }
    }
    return { busy, message, error, run, keyFor };
}
