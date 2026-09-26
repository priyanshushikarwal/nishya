export interface HeroSlideData {
  id: number | string;
  /** Full-bleed editorial photo — the entire card IS the photo */
  image: string;
  ctaText: string;
  ctaLink: string;
}

export const heroSlidesData: HeroSlideData[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    image: "https://wbrxwsenrilaxjgdeish.supabase.co/storage/v1/object/public/cms-media/1790380083976_file_00000000c46082118a6e4515b_in09ni.png",
    ctaText: "DISCOVER",
    ctaLink: "/products",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    image: "/images/nishya/carry_your_story_black_gold.jpg",
    ctaText: "EXPLORE",
    ctaLink: "/products",
  },
  {
    id: "08b6b2b9-678d-478f-a285-3fca2924cdd8",
    image: "https://wbrxwsenrilaxjgdeish.supabase.co/storage/v1/object/public/cms-media/1790381047781_IMG_20260925_132335_1tc48s.png",
    ctaText: "SHOP NOW",
    ctaLink: "/product/safari-quilted-laptop-bag",
  },
  {
    id: "fcc254ad-8e68-47ae-a06c-71107d0ee009",
    image: "https://wbrxwsenrilaxjgdeish.supabase.co/storage/v1/object/public/cms-media/1790381084583_file_00000000d3a4821195dbd3bb5_373igg.png",
    ctaText: "SHOP NOW",
    ctaLink: "/product/safari-quilted-laptop-bag",
  },
  {
    id: "e4c43d42-b4b5-417a-aa21-aae6f895736b",
    image: "https://wbrxwsenrilaxjgdeish.supabase.co/storage/v1/object/public/cms-media/1790381144103_Gemini_Generated_Image_aolgria_opgtao.png",
    ctaText: "SHOP NOW",
    ctaLink: "/product/safari-quilted-laptop-bag",
  },
];
