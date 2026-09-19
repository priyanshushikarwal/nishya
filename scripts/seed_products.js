const ts = require('typescript');
const fs = require('fs');

const code = fs.readFileSync('src/data/products.ts', 'utf8');
const js = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const mod = {};
const fn = new Function('exports', js);
fn(mod);

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'object') return "'" + JSON.stringify(val).replace(/'/g, "''") + "'::jsonb";
  return "'" + String(val).replace(/'/g, "''") + "'";
}

const lines = ['-- Seed all 18 catalog products'];
for (const p of mod.products) {
  lines.push(`INSERT INTO public.products (
    id, name, slug, tagline, price, original_price,
    image, secondary_image, gallery, category, badge,
    description, story, details, care, material,
    dimensions, weight, closure, interior, strap,
    lining, sku, origin, color, colors, rating,
    review_count, in_stock, stock_quantity, featured, status
  ) VALUES (
    ${esc(p.id)}, ${esc(p.name)}, ${esc(p.slug)}, ${esc(p.tagline)}, ${esc(p.price)}, ${esc(p.originalPrice)},
    ${esc(p.image)}, ${esc(p.secondaryImage)}, ${esc(p.gallery || [p.image])}, ${esc(p.category)}, ${esc(p.badge)},
    ${esc(p.description)}, ${esc(p.story)}, ${esc(p.details || [])}, ${esc(p.care || [])}, ${esc(p.material)},
    ${esc(p.dimensions)}, ${esc(p.weight)}, ${esc(p.closure)}, ${esc(p.interior)}, ${esc(p.strap)},
    ${esc(p.lining)}, ${esc(p.sku)}, ${esc(p.origin)}, ${esc(p.color)}, ${esc(p.colors || [])}, ${esc(p.rating || 5.0)},
    ${esc(p.reviewCount || 0)}, ${esc(p.inStock !== false)}, ${esc(p.stockQuantity || 25)}, ${esc(!!p.featured)}, 'published'
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    stock_quantity = EXCLUDED.stock_quantity,
    in_stock = EXCLUDED.in_stock;`);
}

fs.writeFileSync('backend/seed_products.sql', lines.join('\n\n'), 'utf8');
console.log('Successfully wrote backend/seed_products.sql with', mod.products.length, 'products');
