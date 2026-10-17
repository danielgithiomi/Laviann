import { notFound } from 'next/navigation';
import { loadCatalog } from '@laviann/shared/server';
import { Catalogue } from '../../../components/catalogue';
export const dynamic = 'force-dynamic';
export default async function Category({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const catalog = await loadCatalog();
    const category = catalog.categories.find(c => c.slug === slug && c.active);
    if (!category) notFound();
    return <Catalogue catalog={catalog} category={category.id} />;
}
