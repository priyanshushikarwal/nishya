const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await sb
    .from('products')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Failed to fetch products:', error);
    return;
  }

  const mapped = data
    .filter(
      (p) =>
        p.slug !== 'penguin-bucket-rope-bag' &&
        p.slug !== 'bear-bucket-rope-bag' &&
        !p.slug.includes('penguin') &&
        !p.slug.includes('bear-bucket')
    )
    .map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      tagline: row.tagline || undefined,
      price: Number(row.price),
      originalPrice: row.original_price ? Number(row.original_price) : undefined,
      image: row.image,
      secondaryImage: row.secondary_image || undefined,
      gallery: Array.isArray(row.gallery) ? row.gallery : [row.image],
      category: row.category,
      badge: row.badge || undefined,
      description: row.description,
      story: row.story || undefined,
      details: Array.isArray(row.details) ? row.details : [],
      care: Array.isArray(row.care) ? row.care : [],
      material: row.material || undefined,
      dimensions: row.dimensions || undefined,
      weight: row.weight || undefined,
      closure: row.closure || undefined,
      interior: row.interior || undefined,
      strap: row.strap || undefined,
      lining: row.lining || undefined,
      sku: row.sku || undefined,
      origin: row.origin || undefined,
      color: row.color || undefined,
      colors: Array.isArray(row.colors) ? row.colors : [],
      rating: Number(row.rating || 5.0),
      reviewCount: Number(row.review_count || 0),
      inStock: Boolean(row.in_stock),
      featured: Boolean(row.featured),
    }));

  const code =
    'import { Product } from "@/types/product";\n\nexport const products: Product[] = ' +
    JSON.stringify(mapped, null, 2) +
    ';\n';

  fs.writeFileSync('./src/data/products.ts', code, 'utf8');
  console.log(`Successfully synced ${mapped.length} published products into src/data/products.ts`);
}

run();
