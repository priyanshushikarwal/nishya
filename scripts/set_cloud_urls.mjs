import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);
const SUPABASE_STORAGE_BASE = "https://wbrxwsenrilaxjgdeish.supabase.co/storage/v1/object/public/product-media/products";

async function updateToCloudUrls() {
  const { data: prods, error } = await supabase.from("products").select("*");
  if (error) {
    console.error("Fetch error:", error);
    return;
  }

  let updatedCount = 0;

  for (const p of prods) {
    if (p.image && p.image.startsWith("/images/products/")) {
      const parts = p.image.split("/");
      const slug = parts[3];
      const filename = parts[4];

      const cloudImage = `${SUPABASE_STORAGE_BASE}/${slug}/${filename}`;
      let cloudSecondary = cloudImage;
      if (p.secondary_image && p.secondary_image.startsWith("/images/products/")) {
        const secParts = p.secondary_image.split("/");
        cloudSecondary = `${SUPABASE_STORAGE_BASE}/${secParts[3]}/${secParts[4]}`;
      }

      let cloudGallery = [cloudImage];
      if (Array.isArray(p.gallery)) {
        cloudGallery = p.gallery.map((g) => {
          if (typeof g === "string" && g.startsWith("/images/products/")) {
            const gParts = g.split("/");
            return `${SUPABASE_STORAGE_BASE}/${gParts[3]}/${gParts[4]}`;
          }
          return g;
        });
      }

      await supabase
        .from("products")
        .update({
          image: cloudImage,
          secondary_image: cloudSecondary,
          gallery: cloudGallery,
        })
        .eq("id", p.id);

      console.log(`✓ Updated to Cloud URL: ${p.slug}`);
      updatedCount++;
    }
  }

  console.log(`\nSuccess! Updated ${updatedCount} products to Supabase Storage CDN URLs.`);
}

updateToCloudUrls();
