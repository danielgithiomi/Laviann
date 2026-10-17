'use client';
import { Button, Notice } from '@laviann/shared/ui';
export default function ErrorPage({ reset }: { reset: () => void }) {
    return (
        <section className="card stack">
            <h1>LET’S RECONNECT YOUR WORKSPACE.</h1>
            <Notice error>Current data could not be loaded. No action has been confirmed by this screen.</Notice>
            <Button onClick={reset}>Try again</Button>
        </section>
    );
}
