export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  count: number;
}

export const categories: Category[] = [
  {
    id: "all",
    name: "All Bags",
    slug: "all",
    description: "Browse the entire Nishya haute couture collection",
    count: 31,
  },
  {
    id: "totes",
    name: "Totes",
    slug: "totes",
    description: "Spacious everyday vessels crafted in Italian canvas & calfskin",
    count: 6,
  },
  {
    id: "laptop-bags",
    name: "Laptop Bags",
    slug: "laptop-bags",
    description: "Artisanal quilted laptop briefcases and shockproof carriers",
    count: 5,
  },
  {
    id: "sling-bags",
    name: "Sling Bags",
    slug: "sling-bags",
    description: "Versatile crescent and crossbody silhouettes for hands-free chic",
    count: 4,
  },
  {
    id: "backpacks",
    name: "Backpacks",
    slug: "backpacks",
    description: "Ergonomic quilted backpacks with dual-compartment tech organizers",
    count: 4,
  },
  {
    id: "clutches",
    name: "Clutches",
    slug: "clutches",
    description: "Sculptural vanity pouches and pleated clutches",
    count: 5,
  },
  {
    id: "yoga-gym-bags",
    name: "Yoga & Gym Bags",
    slug: "yoga-gym-bags",
    description: "Active luxury duffles with integrated yoga mat straps",
    count: 2,
  },
  {
    id: "hats-headwear",
    name: "Hats & Headwear",
    slug: "hats-headwear",
    description: "Florentine Riviera bucket hats and wide-brim sun protection",
    count: 3,
  },
  {
    id: "handbags",
    name: "Handbags",
    slug: "handbags",
    description: "Architectural top-handle statement silhouettes",
    count: 4,
  },
  {
    id: "shoulder-bags",
    name: "Shoulder Bags",
    slug: "shoulder-bags",
    description: "Effortless underarm classics with polished brass accents",
    count: 3,
  },
];
