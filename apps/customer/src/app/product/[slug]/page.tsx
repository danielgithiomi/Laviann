import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadCatalog } from '@laviann/shared/server';
import { ProductDetail } from '../../../components/product-detail';
export const dynamic = 'force-dynamic';
export default async function Product({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ edit?: string }>;
}) {
    const { slug } = await params;
    const { edit } = await searchParams;
    const catalog = await loadCatalog();
    const product = catalog.products.find(p => p.slug === slug && p.active);
    if (!product) notFound();
    return (
        <>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/shop">All cuts</Link>
                <span>/</span>
                <span>{product.name}</span>
            </nav>
            <ProductDetail product={product} editId={edit} />
        </>
    );
}
