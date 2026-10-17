import Link from 'next/link';
import { loadCatalog } from '@laviann/shared/server';
import { Icon, ProductArt } from '@laviann/shared/ui';
import { Catalogue } from '../components/catalogue';
export const dynamic = 'force-dynamic';
export default async function Home() {
    const catalog = await loadCatalog();
    return (
        <>
            <section className="hero">
                <div className="hero-copy">
                    <span className="eyebrow">YOUR CUT. YOUR PORTION. YOUR TABLE.</span>
                    <h1>
                        QUALITY MEATS,
                        <br />
                        GREATER MEALS.
                    </h1>
                    <p>
                        From everyday favourites to the weekend centrepiece. Raw chicken and beef, portioned around the way you
                        cook.
                    </p>
                    <Link className="btn btn-primary" href="/shop">
                        Explore the cuts <Icon name="arrow" size={18} />
                    </Link>
                    <div className="hero-footnote">
                        <Icon name="pin" size={18} />
                        <span>Planned delivery across five Mauritius regions</span>
                    </div>
                </div>
                <div className="hero-image">
                    <ProductArt slug="hero" name="beef" priority />
                    <div className="hero-stamp">
                        <Icon name="cut" size={26} />
                        <span>
                            CUT & PACKED
                            <br />
                            <strong>YOUR WAY</strong>
                        </span>
                    </div>
                    <span className="hero-caption">Illustrated selection · raw cuts</span>
                </div>
            </section>
            <div className="promise-strip">
                <div>
                    <Icon name="cut" />
                    <span>
                        <strong>Made for your kitchen</strong>
                        <small>Choose weight, cut & portions</small>
                    </span>
                </div>
                <div>
                    <Icon name="check" />
                    <span>
                        <strong>Review before we prepare</strong>
                        <small>Approve your exact quotation</small>
                    </span>
                </div>
                <div>
                    <Icon name="truck" />
                    <span>
                        <strong>A delivery day you can plan for</strong>
                        <small>Vendor-offered dates by region</small>
                    </span>
                </div>
            </div>
            <Catalogue catalog={catalog} />
            <section className="how-panel" id="how-it-works">
                <div>
                    <span className="eyebrow">A better way to order</span>
                    <h2>
                        FROM OUR COUNTER
                        <br />
                        TO YOUR KITCHEN.
                    </h2>
                    <p>No guesswork about portions, prices or what happens next.</p>
                </div>
                <ol>
                    <li>
                        <span>01</span>
                        <div>
                            <strong>Make it yours</strong>
                            <p>Pick your raw cuts, weight and pack sizes.</p>
                        </div>
                    </li>
                    <li>
                        <span>02</span>
                        <div>
                            <strong>Review your quotation</strong>
                            <p>The vendor reviews your request. You approve the exact quote.</p>
                        </div>
                    </li>
                    <li>
                        <span>03</span>
                        <div>
                            <strong>We prepare for your day</strong>
                            <p>Stock is reserved at approval, then prepared for your regional delivery.</p>
                        </div>
                    </li>
                </ol>
            </section>
        </>
    );
}
