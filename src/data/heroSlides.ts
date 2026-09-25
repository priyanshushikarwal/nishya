export interface HeroSlideData {
  id: number;
  /** Full-bleed editorial photo — the entire card IS the photo */
  image: string;
  ctaText: string;
  ctaLink: string;
}

export const heroSlidesData: HeroSlideData[] = [
  {
    id: 1,
    image: "/images/nishya/carry_your_story_pink_arch.jpg",
    ctaText: "SHOP NOW",
    ctaLink: "/products",
  },
  {
    id: 2,
    image: "/images/nishya/carry_your_story_black_gold.jpg",
    ctaText: "EXPLORE",
    ctaLink: "/products",
  },
  {
    id: 3,
    image: "/images/nishya/carry_your_story_pink_float.jpg",
    ctaText: "DISCOVER",
    ctaLink: "/products",
  },
  {
    id: 4,
    image: "/images/nishya/little_things_big_joys_basket.jpg",
    ctaText: "SHOP NOW",
    ctaLink: "/products",
  },
];
