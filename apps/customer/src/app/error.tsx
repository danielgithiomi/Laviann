'use client';
import { Button, Notice } from '@laviann/shared/ui';
export default function ErrorPage({ reset }: { reset: () => void }) {
    return (
        <section className="card stack section-gap">
            <h1>THE COUNTER WILL BE BACK.</h1>
            <Notice error>
                We could not load the latest information. Please retry; no order has been confirmed by this message.
            </Notice>
            <Button onClick={reset}>Try again</Button>
        </section>
    );
}
