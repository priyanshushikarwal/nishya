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
    count: 12,
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
  {
    id: "totes",
    name: "Totes",
    slug: "totes",
    description: "Spacious everyday vessels crafted in French Taurillon leather",
    count: 2,
  },
  {
    id: "clutches",
    name: "Clutches",
    slug: "clutches",
    description: "Sculptural minaudières and pleated nightfall clutches",
    count: 2,
  },
  {
    id: "mini-bags",
    name: "Mini Bags",
    slug: "mini-bags",
    description: "Petite jewel-toned statements for modern evenings",
    count: 2,
  },
];
