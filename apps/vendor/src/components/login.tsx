'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { BrandLogo, Button, Field, Notice, postJson } from '@laviann/shared/ui';
export function Login({ connected }: { connected: boolean }) {
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const router = useRouter();
    return (
        <main id="main" className="login-shell">
            <section className="login-intro">
                <BrandLogo inverse />
                <span className="eyebrow">THE LAVIANN VENDOR WORKSPACE</span>
                <h1>
                    A GOOD DAY
                    <br />
                    STARTS AT
                    <br />
                    YOUR COUNTER.
                </h1>
                <p>One place for your orders, quotations, stock and regional deliveries.</p>
                <small>Quality Meats, Greater Meals.</small>
            </section>
            <section className="login-form">
                <span className="eyebrow">Welcome back</span>
                <h2>YOUR WORKSPACE AWAITS.</h2>
                <p className="muted">Sign in with your provisioned vendor account.</p>
                {!connected ? (
                    <Notice>
                        Supabase is not configured.{' '}
                        <Link href="/" className="link">
                            Open the labelled read-only demo
                        </Link>
                        .
                    </Notice>
                ) : (
                    <form
                        className="stack"
                        onSubmit={async e => {
                            e.preventDefault();
                            setError('');
                            setBusy(true);
                            const f = new FormData(e.currentTarget);
                            try {
                                await postJson('/api/login', { email: f.get('email'), password: f.get('password') });
                                router.push('/');
                                router.refresh();
                            } catch (e) {
                                setError(e instanceof Error ? e.message : 'Sign-in failed.');
                            } finally {
                                setBusy(false);
                            }
                        }}
                    >
                        <Field label="Email address">
                            <input name="email" type="email" autoComplete="username" required />
                        </Field>
                        <Field label="Password">
                            <input name="password" type="password" autoComplete="current-password" minLength={8} required />
                        </Field>
                        {error && <Notice error>{error}</Notice>}
                        <Button type="submit" disabled={busy}>
                            {busy ? 'Signing in…' : 'Sign in to workspace →'}
                        </Button>
                    </form>
                )}
                <p className="login-help">
                    Access is limited to the authorized owner. Account setup is managed by the project administrator.
                </p>
            </section>
        </main>
    );
}
