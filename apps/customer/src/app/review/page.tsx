import { configured } from '@laviann/shared/server';
import { Review } from '../../components/review';
export const dynamic = 'force-dynamic';
export default function ReviewPage() {
    return (
        <>
            <div className="page-heading">
                <div>
                    <span className="eyebrow">03 / Review & request</span>
                    <h1>READY FOR THE VENDOR’S REVIEW.</h1>
                </div>
            </div>
            <Review connected={configured()} />
        </>
    );
}
