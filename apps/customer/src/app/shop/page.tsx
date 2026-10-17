import { loadCatalog } from '@laviann/shared/server';
import { Catalogue } from '../../components/catalogue';
export const dynamic = 'force-dynamic';
export default async function Shop() {
    return (
        <>
            <div className="page-heading">
                <div>
                    <span className="eyebrow">The Laviann counter</span>
                    <h1>FIND YOUR NEXT FAVOURITE.</h1>
                    <p>Raw chicken and beef. Choose a cut to make it yours.</p>
                </div>
            </div>
            <Catalogue catalog={await loadCatalog()} />
        </>
    );
}
