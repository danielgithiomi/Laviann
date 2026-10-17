import Link from 'next/link';
export default function NotFound() {
    return (
        <section className="card stack">
            <h1>THIS RECORD ISN’T AVAILABLE.</h1>
            <p>Return to the queue for the latest orders.</p>
            <Link className="btn btn-primary" href="/orders">
                Open orders
            </Link>
        </section>
    );
}
