-- Seed all 18 catalog products

INSERT INTO public.products (
    id, name, slug, tagline, price, original_price,
    image, secondary_image, gallery, category, badge,
    description, story, details, care, material,
    dimensions, weight, closure, interior, strap,
    lining, sku, origin, color, colors, rating,
    review_count, in_stock, stock_quantity, featured, status
  ) VALUES (
    'nishya-1', 'Safari Quilted Laptop Bag', 'safari-quilted-laptop-bag', 'Carry Your Story', 3499, 5999,
    '/images/nishya/carry_your_story_pink_arch.jpg', '/images/nishya/carry_your_story_pink_float.jpg', '["/images/nishya/carry_your_story_pink_arch.jpg","/images/nishya/carry_your_story_pink_float.jpg","/images/nishya/product_pink_safari_isolated.png","/images/nishya/hero_safari_clean.jpg","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85"]'::jsonb, 'Laptop Bags', 'Bestseller',
    'Everyday elegance in every detail. Handcrafted quilted laptop bag featuring iconic jungle fauna illustrations with padded protection and dual carrying handles.', 'An evocative ode to safari flora and fauna. Every quilted seam is individually guided by generational artisans in Jaipur, marrying whimsical botanical illustrations with robust tech-grade protection and Italian-style poise.', '["Signature quilted blush pink cotton canvas","Handcrafted toucan, zebra, and leopard motif","High-density padded interior fits up to 15.6 inch laptops","Reinforced dual carry handles and heavy-duty brass zip closure","Water-resistant interior twill lining with cable organizer pockets"]'::jsonb, '["Spot clean gently with a damp cotton cloth and mild organic soap.","Do not machine wash, bleach, or dry clean.","Store in the provided Nishya satin dustbag away from direct sunlight.","Allow to air dry naturally at room temperature."]'::jsonb, '100% Organic Cotton Canvas with High-Density Quilted Padding',
    '38cm (W) x 28cm (H) x 4cm (D)', '480g (Ultralight poise)', 'Dual heavy-duty antiqued brass zipper with leather pulls', '15.6" padded laptop compartment + 2 phone & accessory slip pockets', 'Dual reinforced carry handles (14cm drop) + detachable shoulder strap',
    'Water-resistant micro-twill satin in champagne rose', 'NIS-SAF-001', 'Handcrafted in Jaipur, India', 'Blush Safari', '[{"name":"Blush Safari","hex":"#E8B4AA"},{"name":"Mughal Noir","hex":"#1A1A1A"},{"name":"Champagne Pearl","hex":"#ECE2D0"}]'::jsonb, 4.9,
    218, TRUE, 25, TRUE, 'published'
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    stock_quantity = EXCLUDED.stock_quantity,
    in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (
    id, name, slug, tagline, price, original_price,
    image, secondary_image, gallery, category, badge,
    description, story, details, care, material,
    dimensions, weight, closure, interior, strap,
    lining, sku, origin, color, colors, rating,
    review_count, in_stock, stock_quantity, featured, status
  ) VALUES (
    'nishya-2', 'Mughal Forest Laptop Bag', 'mughal-forest-laptop-bag', 'Heritage in Every Detail', 3499, 5999,
    '/images/nishya/carry_your_story_black_gold.jpg', '/images/nishya/carry_your_story_black_gold.jpg', '["/images/nishya/carry_your_story_black_gold.jpg","/images/nishya/product_mughal_forest_isolated.png","/images/pursia/product_black_bag.png","/images/pursia/card_noir_bg.jpg","https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=85"]'::jsonb, 'Laptop Bags', 'Heritage Edition',
    'Intricately quilted Indian botanical tree miniature art pattern in noir and antique gold with dual reinforced handles and premium cushioned protection.', 'Inspired by 17th-century Mughal botanical court paintings. Rendered in deep evergreen, antique gold, and noir quilted canvas, framing majestic forest wildlife with regal distinction.', '["Indian miniature-inspired heritage forest print","Gold and midnight forest green quilted palette","Padded compartment fits up to 15.6 inch laptops","Heavy-duty antiqued brass zip hardware","Reinforced base and stress points for enduring durability"]'::jsonb, '["Gently wipe with soft dry or slightly damp micro-fiber cloth.","Avoid abrasive brushes and chemical solvents.","Keep filled with tissue paper when storing to preserve crisp form."]'::jsonb, 'Quilted Cotton Canvas with Micro-Fiber Lining',
    '38cm (W) x 28cm (H) x 4cm (D)', '495g', 'Heavy-duty antiqued brass dual zip', '15.6" padded laptop compartment + 3 stationery pockets', 'Reinforced dual carry handles + adjustable crossbody strap',
    'Midnight forest green microsuede', 'NIS-MUG-002', 'Handcrafted in Jaipur, India', 'Forest Noir & Gold', '[{"name":"Forest Noir & Gold","hex":"#232B28"},{"name":"Blush Safari","hex":"#E8B4AA"},{"name":"Onyx Black","hex":"#151418"}]'::jsonb, 5,
    164, TRUE, 25, TRUE, 'published'
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    stock_quantity = EXCLUDED.stock_quantity,
    in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (
    id, name, slug, tagline, price, original_price,
    image, secondary_image, gallery, category, badge,
    description, story, details, care, material,
    dimensions, weight, closure, interior, strap,
    lining, sku, origin, color, colors, rating,
    review_count, in_stock, stock_quantity, featured, status
  ) VALUES (
    'nishya-3', 'Penguin Artisan Rope Basket', 'penguin-artisan-rope-basket', 'Little Things Big Joys', 1899, 2999,
    '/images/nishya/little_things_big_joys_basket.jpg', '/images/nishya/little_things_big_joys_basket.jpg', '["/images/nishya/little_things_big_joys_basket.jpg","/images/nishya/product_penguin_basket_isolated.png","https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85"]'::jsonb, 'Artisan Storage', 'New Arrival',
    'Hand-coiled natural cotton rope animal storage basket. Beautiful functional storage for nursery, vanity, desk, and everyday joys.', 'Artisan braided from 100% pure organic cotton rope. Designed to cradle vanity essentials, accessories, and bedtime comforts with tactile warmth and joyful craftsmanship.', '["Handcrafted 100% natural braided cotton rope","Charming hand-stitched penguin face with pom-pom nose","Soft, collapsible yet sturdy standing structure","Eco-friendly, chemical-free and baby-safe"]'::jsonb, '["Hand wash with mild detergent if necessary.","Reshape while slightly damp and air dry flat in shade.","Do not tumble dry."]'::jsonb, '100% Braided Organic Cotton Rope',
    '22cm (Diameter) x 18cm (H)', '340g', 'Open-top easy access architecture', 'Seamlessly woven coiled interior without rough edges', 'Dual integrated rope carry loops',
    'Natural unbleached organic cotton fibers', 'NIS-BAS-003', 'Handcrafted in Rajasthan, India', 'Aqua Sky Blue', '[{"name":"Aqua Sky Blue","hex":"#63B4C8"},{"name":"Chalk Cream","hex":"#F3EDE2"},{"name":"Blush Rose","hex":"#E8B4AA"}]'::jsonb, 4.9,
    97, TRUE, 25, TRUE, 'published'
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    stock_quantity = EXCLUDED.stock_quantity,
    in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (
    id, name, slug, tagline, price, original_price,
    image, secondary_image, gallery, category, badge,
    description, story, details, care, material,
    dimensions, weight, closure, interior, strap,
    lining, sku, origin, color, colors, rating,
    review_count, in_stock, stock_quantity, featured, status
  ) VALUES (
    'prod-1', 'Golden Pyramid Handbag', 'golden-pyramid-handbag', 'Trendy Pyramid Shaped', 2999, 5999,
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85', '["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85","/images/nishya/product_golden_pyramid_isolated.png","https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=85"]'::jsonb, 'Handbags', '50% OFF',
    'Crafted handbag designed with pyramid-inspired structural geometry and custom hand-polished gold hardware. Features soft Italian calfskin and an architectural silhouette.', 'An architectural marvel drawing inspiration from geometric modernist sculptures. Hand-sculpted in vegetable-tanned calfskin with 18k gilded pyramid accents.', '["Structured geometric pyramid silhouette","Signature brushed 18k gold-finish clasp","Detachable slender leather crossbody strap","Hand-painted beveled edges","Interior zip compartment and phone pocket"]'::jsonb, '["Polish leather surface periodically with Nishya natural beeswax balm.","Keep hardware dry and buff with lint-free microfiber.","Store in satin dustbag away from humidity."]'::jsonb, 'Full-grain Italian calfskin with micro-suede lining',
    '24cm (W) x 21cm (H) x 12cm (D)', '540g', '18K gilded pyramid clasp with hidden magnetic lock', 'Main compartment, lipstick slot, zippered coin pouch', 'Detachable curb-link gold chain (52cm drop) + top leather handle',
    'Italian champagne satin lining', 'NIS-PYR-004', 'Handcrafted in Florence, Italy', 'Warm Cognac Gold', '[{"name":"Warm Cognac","hex":"#B87924"},{"name":"Onyx Black","hex":"#1A1A1A"},{"name":"Chalk Ivory","hex":"#F3EDE2"}]'::jsonb, 4.9,
    142, TRUE, 25, TRUE, 'published'
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    stock_quantity = EXCLUDED.stock_quantity,
    in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (
    id, name, slug, tagline, price, original_price,
    image, secondary_image, gallery, category, badge,
    description, story, details, care, material,
    dimensions, weight, closure, interior, strap,
    lining, sku, origin, color, colors, rating,
    review_count, in_stock, stock_quantity, featured, status
  ) VALUES (
    'prod-2', 'Classic Black Shoulder Bag', 'classic-black-shoulder-bag', 'Timeless Parisian Silhouette', 2499, 4999,
    'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1000&q=85', '["https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=85","/images/pursia/product_black_bag.png","/images/pursia/card_noir_bg.jpg","https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=1200&q=85"]'::jsonb, 'Shoulder Bags', 'Bestseller',
    'Sculpted from satin-finish black box calfskin. A sleek crescent shoulder bag adorned with a polished golden twist lock for effortless day-to-night transitions.', 'Designed for the woman in perpetual motion. The curved underarm contour nestles naturally beneath the shoulder while the mirror-polished brass turnlock glimmers like fine jewelry.', '["Ergonomic underarm curve","Reinforced base with metal protective feet","Gold-tone monogrammed turnlock","Ultra-lightweight luxury construction"]'::jsonb, '["Wipe clean with a soft dry cloth.","Condition leather once annually with high-grade neutral cream.","Store in dustbag when not in use."]'::jsonb, 'Semi-matte box calfskin with satin lining',
    '27cm (W) x 15cm (H) x 7cm (D)', '420g', 'Gold-tone monogrammed turnlock', 'Central zippered compartment with suede slip pocket', 'Integrated shoulder strap with 24cm ergonomic drop',
    'Midnight charcoal satin', 'NIS-CSB-005', 'Handcrafted in Florence, Italy', 'Nocturne Black', '[{"name":"Nocturne Black","hex":"#151418"},{"name":"Espresso Brown","hex":"#3D2B1F"},{"name":"Warm Cognac","hex":"#B87924"}]'::jsonb, 4.8,
    98, TRUE, 25, TRUE, 'published'
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    stock_quantity = EXCLUDED.stock_quantity,
    in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (
    id, name, slug, tagline, price, original_price,
    image, secondary_image, gallery, category, badge,
    description, story, details, care, material,
    dimensions, weight, closure, interior, strap,
    lining, sku, origin, color, colors, rating,
    review_count, in_stock, stock_quantity, featured, status
  ) VALUES (
    'prod-3', 'Ruby Mini Handbag', 'ruby-mini-handbag', 'Petite Statement of Elegance', 2799, 5599,
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85', '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85","/images/pursia/product_pink_bag.png","https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85","/images/pursia/card_rose_bg.jpg","https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=85"]'::jsonb, 'Mini Bags', 'New',
    'Striking jewel-toned crimson leather with refined top handle and gilded chain strap. Designed for evenings where less is infinitely more.', 'Conceived as a precious gem you wear upon your wrist. The hand-lacquered croco emboss catches nocturnal illumination with understated radiance.', '["Structured micro-silhouette","Dual carry: top handle and curb chain","Magnetic flap closure with gold bar emblem"]'::jsonb, '["Avoid contact with light-colored textiles during high humidity.","Buff lightly with a clean dry cotton rag."]'::jsonb, 'Embossed croco-finish leather',
    '19cm (W) x 13cm (H) x 6cm (D)', '360g', 'Magnetic snap flap with gilded bar emblem', '1 main compartment + 3 dedicated cardholder slots', 'Removable 18k gold curb chain (50cm drop) + top rolled handle',
    'Ruby wine microsuede', 'NIS-RBY-006', 'Handcrafted in Milan, Italy', 'Imperial Ruby', '[{"name":"Imperial Ruby","hex":"#8A1828"},{"name":"Emerald Forest","hex":"#174D38"},{"name":"Onyx Black","hex":"#151418"}]'::jsonb, 4.9,
    84, TRUE, 25, TRUE, 'published'
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    stock_quantity = EXCLUDED.stock_quantity,
    in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (
    id, name, slug, tagline, price, original_price,
    image, secondary_image, gallery, category, badge,
    description, story, details, care, material,
    dimensions, weight, closure, interior, strap,
    lining, sku, origin, color, colors, rating,
    review_count, in_stock, stock_quantity, featured, status
  ) VALUES (
    'prod-4', 'Ivory Structured Tote', 'ivory-structured-tote', 'Architectural Purity', 3499, 6999,
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85', '["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85","/images/pursia/product_cognac_bag.png"]'::jsonb, 'Totes', 'Limited Edition',
    'Immaculate chalk-white pebble grain leather structured to hold a laptop and daily essentials while maintaining razor-sharp editorial poise.', 'Purity distilled into architectural form. Tailored in supple Taurillon bull-calf leather with heat-embossed edge bevels and whisper-quiet magnetic wing gussets.', '["Holds up to 13-inch laptop and tablet","Padded dual shoulder handles for effortless daily carry","Central zip divider compartment with brass lock","Magnetic side snaps for expandable volume"]'::jsonb, '["Treat occasionally with water-repellent leather protectant.","Wipe clean immediately if exposed to colored liquids.","Store upright in dustbag."]'::jsonb, 'Pebbled French Taurillon leather',
    '36cm (W) x 28cm (H) x 14cm (D)', '720g', 'Central zip security divider + magnetic top clasp', 'Triple compartment: 1 zipped center + 2 open magnetic bays', 'Dual flat shoulder straps with 26cm drop',
    'Natural beige microfiber suede', 'NIS-IVR-007', 'Handcrafted in Florence, Italy', 'Alabaster Ivory', '[{"name":"Alabaster Ivory","hex":"#F3EDE2"},{"name":"Caramel Tan","hex":"#9E6438"},{"name":"Midnight Black","hex":"#1A1A1A"}]'::jsonb, 5,
    112, TRUE, 25, TRUE, 'published'
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    stock_quantity = EXCLUDED.stock_quantity,
    in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (
    id, name, slug, tagline, price, original_price,
    image, secondary_image, gallery, category, badge,
    description, story, details, care, material,
    dimensions, weight, closure, interior, strap,
    lining, sku, origin, color, colors, rating,
    review_count, in_stock, stock_quantity, featured, status
  ) VALUES (
    'prod-5', 'Vintage Brown Handbag', 'vintage-brown-handbag', 'Heritage Saddle Finish', 2699, 5399,
    'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85', '["https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85","/images/pursia/product_cognac_bag.png","/images/pursia/card_cognac_bg.jpg"]'::jsonb, 'Handbags', 'Heritage',
    'Rich vegetable-tanned leather that develops a gorgeous, distinguished patina over time. Finished with artisanal contrast saddle-stitching.', 'A tribute to classic equestrian craft. Imbued with deep bark tannins that age with distinguished character, recording the unique memories and journeys of the wearer.', '["Hand-burnished waxed leather","Antiqued brass twist hardware","Adjustable strap with custom buckle"]'::jsonb, '["Apply high-quality leather conditioner twice annually.","Embrace natural tonal patina and grain variations as badges of authenticity."]'::jsonb, 'Vegetable-tanned Tuscan leather',
    '28cm (W) x 20cm (H) x 9cm (D)', '580g', 'Antiqued brass twist turnlock', '1 main accordion compartment + 1 zip security pocket', 'Adjustable saddle-stitched leather strap (48cm - 56cm drop)',
    'Raw suede reverse side with wax edge seal', 'NIS-VNT-008', 'Handcrafted in Tuscany, Italy', 'Amber Mahogany', '[{"name":"Amber Mahogany","hex":"#6E371C"},{"name":"Chestnut","hex":"#8F4F28"},{"name":"Warm Cognac","hex":"#B87924"}]'::jsonb, 4.8,
    76, TRUE, 25, FALSE, 'published'
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    stock_quantity = EXCLUDED.stock_quantity,
    in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (
    id, name, slug, tagline, price, original_price,
    image, secondary_image, gallery, category, badge,
    description, story, details, care, material,
    dimensions, weight, closure, interior, strap,
    lining, sku, origin, color, colors, rating,
    review_count, in_stock, stock_quantity, featured, status
  ) VALUES (
    'prod-6', 'Blush Evening Clutch', 'blush-evening-clutch', 'Delicate Nightfall Companion', 1999, 3999,
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=85', '["https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85","/images/pursia/product_pink_bag.png","/images/pursia/card_rose_bg.jpg"]'::jsonb, 'Clutches', '50% OFF',
    'Whisper-soft rose blush nappa leather folded with sculptural accordion pleats. Accented with a sleek gold-tone minaudière clasp.', 'Fluid couture evening wear condensed into an exquisite handheld clutch. Soft lambskin pleats expand gracefully to accommodate evening makeup, phone, and keepsake invitations.', '["Sculptural origami pleating","Concealed chain strap tucks inside","Card slots and compact mirror included"]'::jsonb, '["Store in satin dustbag away from sharp jewelry.","Gently pat clean with soft dry cloth."]'::jsonb, 'Italian nappa lambskin',
    '22cm (W) x 12cm (H) x 5cm (D)', '290g', 'Magnetic kissing clasp with 18k gold bar accent', 'Silk-lined interior with built-in compact vanity mirror', 'Concealable fine jewelry chain strap (54cm drop)',
    'Blush champagne silk satin', 'NIS-BLU-009', 'Handcrafted in Florence, Italy', 'Powder Blush', '[{"name":"Powder Blush","hex":"#E7C7BA"},{"name":"Champagne Pearl","hex":"#ECE2D0"},{"name":"Midnight Black","hex":"#1A1A1A"}]'::jsonb, 4.7,
    63, TRUE, 25, FALSE, 'published'
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    stock_quantity = EXCLUDED.stock_quantity,
    in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (
    id, name, slug, tagline, price, original_price,
    image, secondary_image, gallery, category, badge,
    description, story, details, care, material,
    dimensions, weight, closure, interior, strap,
    lining, sku, origin, color, colors, rating,
    review_count, in_stock, stock_quantity, featured, status
  ) VALUES (
    'prod-7', 'Emerald Mini Bag', 'emerald-mini-bag', 'Bold Regal Silhouette', 2299, 4599,
    'https://images.unsplash.com/photo-1614179689702-355944cd0918?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85', '["https://images.unsplash.com/photo-1614179689702-355944cd0918?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85"]'::jsonb, 'Mini Bags', 'Popular',
    'Deep forest emerald green adorned with a bold gold circular buckle. Compact yet deceptively spacious for phone, lipstick, and essentials.', 'Rich gemstone tones meet clean modern lines. Features scratch-resistant cross-grain Saffiano leather crowned by a substantial brushed circular buckle.', '["Round golden statement ring lock","Smooth matte finish with scratch resistance","Adjustable tonal shoulder strap"]'::jsonb, '["Easily cleaned with a damp sponge thanks to resilient Saffiano texture."]'::jsonb, 'Saffiano scratch-resistant calf leather',
    '18cm (W) x 14cm (H) x 7cm (D)', '380g', 'Magnetic snap concealed behind statement ring lock', '1 open slip pouch + 1 zipped security slot', 'Adjustable leather strap (45cm - 55cm drop)',
    'Tone-on-tone forest emerald twill', 'NIS-EME-010', 'Handcrafted in Milan, Italy', 'Imperial Emerald', '[{"name":"Imperial Emerald","hex":"#144231"},{"name":"Midnight Navy","hex":"#17223B"},{"name":"Onyx Noir","hex":"#151418"}]'::jsonb, 4.9,
    91, TRUE, 25, FALSE, 'published'
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    stock_quantity = EXCLUDED.stock_quantity,
    in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (
    id, name, slug, tagline, price, original_price,
    image, secondary_image, gallery, category, badge,
    description, story, details, care, material,
    dimensions, weight, closure, interior, strap,
    lining, sku, origin, color, colors, rating,
    review_count, in_stock, stock_quantity, featured, status
  ) VALUES (
    'prod-8', 'Pearl White Shoulder Bag', 'pearl-white-shoulder-bag', 'Luminous Minimalist Chic', 2599, 5199,
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=85', '["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85"]'::jsonb, 'Shoulder Bags', '50% OFF',
    'Minimalist flap handbag with clean lines and buttery-smooth pearlescent leather. Wear high on the shoulder or tucked under the arm.', 'The quintessential minimalist companion. Pared back to absolute geometry, highlighting the tactile softness of premium milk-white calfskin.', '["Clean linear flap closure","Hidden magnetic snaps","Interior slip pocket"]'::jsonb, '["Wipe clean with a dry microfiber cloth."]'::jsonb, 'Full-grain calfskin leather',
    '26cm (W) x 16cm (H) x 6cm (D)', '410g', 'Dual concealed magnetic snaps', '1 main compartment + card slip pouch', 'Comfort-curved shoulder strap with 22cm drop',
    'Oat sand micro-fiber', 'NIS-PRL-011', 'Handcrafted in Florence, Italy', 'Pearl White', '[{"name":"Pearl White","hex":"#FAF8F5"},{"name":"Oat Sand","hex":"#D6C6B2"}]'::jsonb, 4.8,
    88, TRUE, 25, FALSE, 'published'
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    stock_quantity = EXCLUDED.stock_quantity,
    in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (
    id, name, slug, tagline, price, original_price,
    image, secondary_image, gallery, category, badge,
    description, story, details, care, material,
    dimensions, weight, closure, interior, strap,
    lining, sku, origin, color, colors, rating,
    review_count, in_stock, stock_quantity, featured, status
  ) VALUES (
    'prod-9', 'Tan Everyday Tote', 'tan-everyday-tote', 'Essential Everyday Luxury', 2999, 5999,
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=1000&q=85', '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=1200&q=85","/images/pursia/product_cognac_bag.png"]'::jsonb, 'Totes', 'Essential',
    'Soft unlined leather tote with raw-edge craftsmanship and a complementary removable matching zip pouch for valuables.', 'Spacious and effortlessly slouchy. Hand-cut from supple tumble-grained leather that molds to your silhouette as the day unfolds.', '["Seamless slouchy silhouette","Reinforced double handles","Includes matching zip leather pouch"]'::jsonb, '["Condition occasionally with natural leather cream."]'::jsonb, 'Supple tumble-grained cowhide',
    '34cm (W) x 30cm (H) x 15cm (D)', '610g', 'Bridge collar tie closure', 'Spacious open bay + removable zippered wristlet clutch', 'Dual flat carry handles (25cm drop)',
    'Raw suede interior', 'NIS-TAN-012', 'Handcrafted in Spain', 'Saddle Tan', '[{"name":"Saddle Tan","hex":"#A66A38"},{"name":"Charcoal Smoke","hex":"#2B2A2F"}]'::jsonb, 4.9,
    104, TRUE, 25, FALSE, 'published'
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    stock_quantity = EXCLUDED.stock_quantity,
    in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (
    id, name, slug, tagline, price, original_price,
    image, secondary_image, gallery, category, badge,
    description, story, details, care, material,
    dimensions, weight, closure, interior, strap,
    lining, sku, origin, color, colors, rating,
    review_count, in_stock, stock_quantity, featured, status
  ) VALUES (
    'prod-10', 'Midnight Clutch', 'midnight-clutch', 'Dramatic Evening Allure', 1899, 3799,
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=85', '["https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=85","/images/pursia/product_black_bag.png","/images/pursia/card_noir_bg.jpg"]'::jsonb, 'Clutches', '50% OFF',
    'Sculpted hard-case clutch finished in deep obsidian lacquer with a gold prism clasp. Holds modern smartphones with ease.', 'Sleek and unapologetically glamorous. A sculpted hard-shell minaudière inspired by vintage black-tie soirées.', '["Rigid architectural box design","Jewel-faceted gold closure","Velvet-flocked inner lining"]'::jsonb, '["Buff outer shell with soft microfiber cloth."]'::jsonb, 'High-gloss lacquered resin & brass',
    '20cm (W) x 11cm (H) x 4.5cm (D)', '310g', 'Jewel-faceted push clasp', 'Velvet flocked compartment + card pocket', 'Detachable serpentine gold chain',
    'Plush obsidian black velvet', 'NIS-MID-013', 'Handcrafted in Florence, Italy', 'Obsidian Black', '[{"name":"Obsidian Black","hex":"#111111"},{"name":"Gold Leaf","hex":"#D4AF37"}]'::jsonb, 4.7,
    52, TRUE, 25, FALSE, 'published'
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    stock_quantity = EXCLUDED.stock_quantity,
    in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (
    id, name, slug, tagline, price, original_price,
    image, secondary_image, gallery, category, badge,
    description, story, details, care, material,
    dimensions, weight, closure, interior, strap,
    lining, sku, origin, color, colors, rating,
    review_count, in_stock, stock_quantity, featured, status
  ) VALUES (
    'prod-11', 'Rose Gold Party Bag', 'rose-gold-party-bag', 'Effortless Gala Sparkle', 2399, 4799,
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1000&q=85', '["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85","/images/pursia/product_pink_bag.png","/images/pursia/card_rose_bg.jpg"]'::jsonb, 'Handbags', 'Party Edit',
    'Shimmering metallic leather purse with delicate chain strap and brushed champagne gold fittings that catch ambient light from every angle.', 'Luminous and festive. Created with micro-foiled Italian lambskin that scatters evening light with delicate sophistication.', '["Reflective metallic foil leather","Fine jewelry-grade cable chain","Secure magnetic closure"]'::jsonb, '["Store in velvet pouch away from sharp surfaces."]'::jsonb, 'Metallic foiled nappa leather',
    '21cm (W) x 15cm (H) x 6cm (D)', '330g', 'Magnetic top clasp', 'Silk interior with dual cardholder slots', 'Jewelry-grade cable chain (52cm drop)',
    'Champagne rose satin', 'NIS-ROS-014', 'Handcrafted in Milan, Italy', 'Champagne Rose', '[{"name":"Champagne Rose","hex":"#D8A48F"},{"name":"Platinum Silver","hex":"#D6D6D8"}]'::jsonb, 4.9,
    67, TRUE, 25, FALSE, 'published'
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    stock_quantity = EXCLUDED.stock_quantity,
    in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (
    id, name, slug, tagline, price, original_price,
    image, secondary_image, gallery, category, badge,
    description, story, details, care, material,
    dimensions, weight, closure, interior, strap,
    lining, sku, origin, color, colors, rating,
    review_count, in_stock, stock_quantity, featured, status
  ) VALUES (
    'prod-12', 'Classic Leather Crossbody', 'classic-leather-crossbody', 'The Everyday Icon', 2499, 4999,
    'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=85', '["https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=1200&q=85","/images/pursia/product_cognac_bag.png","/images/pursia/card_cognac_bg.jpg"]'::jsonb, 'Shoulder Bags', 'Classic',
    'Compact saddle bag with equestrian buckle accent and dual compartments to keep all your daily essentials meticulously organized.', 'A perennial house classic. Built for decades of daily companionship with hand-skived edges and saddle stitching.', '["Equestrian-inspired curved flap","Back quick-access slip pocket","Multiple card slots and key leash"]'::jsonb, '["Condition with natural beeswax cream."]'::jsonb, 'Full-grain saddle leather',
    '23cm (W) x 17cm (H) x 8cm (D)', '460g', 'Magnetic snap with decorative equestrian buckle', 'Dual expandable compartments + zip coin pouch', 'Adjustable leather crossbody strap (50cm - 58cm drop)',
    'Tonal twill fabric', 'NIS-CRO-015', 'Handcrafted in Florence, Italy', 'Warm Saddle Brown', '[{"name":"Warm Saddle","hex":"#8C5835"},{"name":"Midnight Black","hex":"#1D1C21"}]'::jsonb, 4.8,
    119, TRUE, 25, FALSE, 'published'
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    stock_quantity = EXCLUDED.stock_quantity,
    in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (
    id, name, slug, tagline, price, original_price,
    image, secondary_image, gallery, category, badge,
    description, story, details, care, material,
    dimensions, weight, closure, interior, strap,
    lining, sku, origin, color, colors, rating,
    review_count, in_stock, stock_quantity, featured, status
  ) VALUES (
    'acc-1', 'Leather Wallet', 'leather-wallet', 'Slimline Bifold Masterpiece', 999, 1999,
    'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80', '["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85"]'::jsonb, 'Wallets', 'Atelier Edit',
    'Slim bifold calfskin cardholder with gold foil stamp and 8 RFID-shielded card slots.', 'Engineered for minimalist pocket poise with ultra-thin skived calf leather.', '["8 precision-cut card slots","Full-length currency sleeve","RFID protective shielding"]'::jsonb, '[]'::jsonb, 'Full-grain Florentine calfskin',
    '11cm (W) x 9cm (H) x 1.5cm (D)', '85g', 'Slim bifold closure', '8 card slots + 2 slip receipt sleeves', NULL,
    'RFID-blocking silk twill', 'NIS-WAL-016', 'Handcrafted in Florence, Italy', 'Cognac Tan', '[{"name":"Cognac Tan","hex":"#B87924"},{"name":"Midnight Noir","hex":"#151418"}]'::jsonb, 4.9,
    43, TRUE, 25, FALSE, 'published'
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    stock_quantity = EXCLUDED.stock_quantity,
    in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (
    id, name, slug, tagline, price, original_price,
    image, secondary_image, gallery, category, badge,
    description, story, details, care, material,
    dimensions, weight, closure, interior, strap,
    lining, sku, origin, color, colors, rating,
    review_count, in_stock, stock_quantity, featured, status
  ) VALUES (
    'acc-2', 'Small Handy Purse', 'small-handy-purse', 'Zipped Coin & Key Pouch', 1499, 2499,
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80', '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85"]'::jsonb, 'Wallets', 'Petite Luxe',
    'Compact zipped coin and key pouch with wristlet in pebble-grained leather.', 'Keep your daily cards, currency, and keys elegantly corralled within your primary handbag.', '["Smooth top zip closure","Detachable leather wristlet","Polished gold key ring leash inside"]'::jsonb, '[]'::jsonb, 'Pebble-grain calf leather',
    '14cm (W) x 9cm (H) x 2cm (D)', '110g', 'Top zip closure', 'Main coin pouch with interior key ring leash', 'Detachable leather wristlet strap (15cm)',
    'Soft cotton canvas', 'NIS-PCH-017', 'Handcrafted in Florence, Italy', 'Blush Rose', '[{"name":"Blush Rose","hex":"#E8B4AA"},{"name":"Caramel","hex":"#9E6438"}]'::jsonb, 4.8,
    56, TRUE, 25, FALSE, 'published'
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    stock_quantity = EXCLUDED.stock_quantity,
    in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (
    id, name, slug, tagline, price, original_price,
    image, secondary_image, gallery, category, badge,
    description, story, details, care, material,
    dimensions, weight, closure, interior, strap,
    lining, sku, origin, color, colors, rating,
    review_count, in_stock, stock_quantity, featured, status
  ) VALUES (
    'acc-3', 'Clutch Bags', 'clutch-bags', 'Pleated Satin Leather Evening Pouch', 1899, 3299,
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=600&q=80', '["https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=85"]'::jsonb, 'Clutches', 'Evening Star',
    'Pleated evening pouch in satin leather with brushed brass frame and drop-in chain.', 'Hand-pleated folds that whisper elegance at galas, opera nights, and celebratory dinners.', '["Gleaming brass kissing clasp","Accordion structure expands on demand","Concealed chain strap"]'::jsonb, '[]'::jsonb, 'Satin nappa lambskin',
    '24cm (W) x 13cm (H) x 5cm (D)', '280g', 'Kissing brass lock', 'Satin lined with vanity pocket', 'Drop-in fine curb chain (50cm drop)',
    'Champagne silk satin', 'NIS-CLU-018', 'Handcrafted in Milan, Italy', 'Gold Leaf', '[{"name":"Gold Leaf","hex":"#D4AF37"},{"name":"Noir","hex":"#151418"}]'::jsonb, 4.8,
    39, TRUE, 25, FALSE, 'published'
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    stock_quantity = EXCLUDED.stock_quantity,
    in_stock = EXCLUDED.in_stock;