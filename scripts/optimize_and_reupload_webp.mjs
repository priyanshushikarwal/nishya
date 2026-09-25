import fs from "fs";
import path from "path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const PUBLIC_PRODUCTS_DIR = path.resolve("public/images/products");
const SUPABASE_STORAGE_BASE = "https://wbrxwsenrilaxjgdeish.supabase.co/storage/v1/object/public/product-media/products";

async function optimizeAndUpload() {
  console.log("=== NISHYA ULTRA-FAST WEBP OPTIMIZATION ===");
  const productFolders = fs.readdirSync(PUBLIC_PRODUCTS_DIR);
  console.log(`Found ${productFolders.length} product folders to optimize.`);

  let totalOriginalBytes = 0;
  let totalOptimizedBytes = 0;

  for (let i = 0; i < productFolders.length; i++) {
    const slug = productFolders[i];
    const folderPath = path.join(PUBLIC_PRODUCTS_DIR, slug);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    console.log(`\n[${i + 1}/${productFolders.length}] Optimizing ${slug}...`);

    const files = fs.readdirSync(folderPath).filter((f) => /\.(png|jpg|jpeg)$/i.test(f));
    const webpGalleryUrls = [];

    // Sort to keep consistent ordering
    files.sort((a, b) => {
      const numA = parseInt(a) || 0;
      const numB = parseInt(b) || 0;
      return numA - numB;
    });

    for (const file of files) {
      const inputPath = path.join(folderPath, file);
      const baseName = path.parse(file).name;
      const webpName = `${baseName}.webp`;
      const outputPath = path.join(folderPath, webpName);

      const originalSize = fs.statSync(inputPath).size;
      totalOriginalBytes += originalSize;

      // 1. Convert to high-performance WebP (max width 1200px, 82% quality)
      const webpBuffer = await sharp(inputPath)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toBuffer();

      fs.writeFileSync(outputPath, webpBuffer);
      totalOptimizedBytes += webpBuffer.length;

      // 2. Upload to Supabase Storage
      const storagePath = `products/${slug}/${webpName}`;
      const { error: uploadError } = await supabase.storage
        .from("product-media")
        .upload(storagePath, webpBuffer, {
          contentType: "image/webp",
          upsert: true,
          cacheControl: "31536000", // 1 year browser/CDN cache
        });

      if (uploadError) {
        console.error(`  Upload error for ${webpName}:`, uploadError.message);
      } else {
        const publicUrl = `${SUPABASE_STORAGE_BASE}/${slug}/${webpName}`;
        webpGalleryUrls.push(publicUrl);
        console.log(`  ✓ ${file} (${(originalSize / 1024).toFixed(0)}KB) → ${webpName} (${(webpBuffer.length / 1024).toFixed(0)}KB)`);
      }
    }

    if (webpGalleryUrls.length > 0) {
      const primaryUrl = webpGalleryUrls[0];
      const secondaryUrl = webpGalleryUrls[1] || primaryUrl;

      // 3. Update database record with new WebP URLs
      const { error: dbError } = await supabase
        .from("products")
        .update({
          image: primaryUrl,
          secondary_image: secondaryUrl,
          gallery: webpGalleryUrls,
        })
        .eq("slug", slug);

      if (dbError) {
        console.error(`  DB update error for ${slug}:`, dbError.message);
      } else {
        console.log(`  ⚡ Updated DB row for ${slug} with WebP URLs.`);
      }
    }
  }

  const savedMb = (totalOriginalBytes - totalOptimizedBytes) / (1024 * 1024);
  const reductionPct = ((1 - totalOptimizedBytes / totalOriginalBytes) * 100).toFixed(1);

  console.log("\n==========================================");
  console.log(`All images optimized to WebP and uploaded!`);
  console.log(`Original Total: ${(totalOriginalBytes / (1024 * 1024)).toFixed(1)} MB`);
  console.log(`Optimized Total: ${(totalOptimizedBytes / (1024 * 1024)).toFixed(1)} MB`);
  console.log(`Data Saved: ${savedMb.toFixed(1)} MB (${reductionPct}% reduction!)`);
  console.log("==========================================");
}

optimizeAndUpload().catch(console.error);
