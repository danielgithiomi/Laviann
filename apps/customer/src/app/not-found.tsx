import Link from 'next/link';
export default function NotFound() {
    return (
        <section className="card stack section-gap">
            <h1>THIS CUT ISN’T ON THE COUNTER.</h1>
            <p>It may no longer be offered. Browse the current selection.</p>
            <Link className="btn btn-primary" href="/shop">
                Back to the shop
            </Link>
        </section>
    );
}
