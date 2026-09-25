import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const BASE_SOURCE_DIR = "C:/Users/Priyanshu/Downloads/drive-download-20260925T111918Z-1-001";
const PUBLIC_PRODUCTS_DIR = path.resolve("public/images/products");

// Ensure public images directory exists
if (!fs.existsSync(PUBLIC_PRODUCTS_DIR)) {
  fs.mkdirSync(PUBLIC_PRODUCTS_DIR, { recursive: true });
}

// Full curated product definitions
const productsCatalog = [
  // --- 1. BACKPACKS ---
  {
    folder: "begpack/Belu Backpack",
    id: "nishya-belu-backpack",
    name: "The Belu Quilted Backpack",
    slug: "belu-quilted-backpack",
    category: "Backpacks",
    badge: "BESTSELLER",
    price: 1499,
    originalPrice: 2799,
    tagline: "Quilted Botanical Craftsmanship & Ergonomic Luxury",
    description: "Engineered for effortless everyday transit, The Belu Quilted Backpack merges plush diamond-quilted canvas with reinforced Italian calfskin trim. Features spacious dual compartments, padded device sleeve, and custom gold-tone hardware.",
    story: "Born in our Florence atelier to bridge leisurely country weekends with busy city commutes. Every Belu backpack undergoes hand-finishing of each quilted seam to ensure lasting structural beauty.",
    details: [
      "Padded protective sleeve accommodating up to 14-inch laptops",
      "Ergonomic contoured shoulder straps with breathable mesh backing",
      "Reinforced top carry handle in burnished leather",
      "Two exterior side slip pockets for flasks or umbrella",
      "Water-repellent interior lining with zippered security compartment"
    ],
    material: "Quilted Cotton Jacquard Canvas & Florentine Leather Accents",
    dimensions: "38cm H × 28cm W × 14cm D",
    weight: "680g",
    closure: "Custom engraved gold-tone double zipper",
    interior: "Silk-finish microfiber lining with zippered security pocket",
    strap: "Adjustable ergonomic shoulder straps (50cm – 90cm)",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Spot clean with mild damp cloth", "Avoid prolonged exposure to torrential rain", "Store in signature Nishya dustbag"],
    color: "Botanical Slate & Sand",
    colors: [
      { name: "Botanical Slate", hex: "#7A8288" },
      { name: "Sand Ecru", hex: "#D6C7B2" }
    ],
    rating: 4.9,
    reviewCount: 38,
    featured: true,
  },
  {
    folder: "begpack/Reindeer Backpack",
    id: "nishya-reindeer-backpack",
    name: "The Reindeer Motif Backpack",
    slug: "reindeer-motif-backpack",
    category: "Backpacks",
    badge: "LIMITED EDITION",
    price: 1499,
    originalPrice: 2799,
    tagline: "Nordic Heritage Embroidery & Whimsical Elegance",
    description: "Featuring intricately woven woodland motifs, The Reindeer Backpack blends whimsical artisanal embroidery with durable structured craftsmanship. Designed with comfortable padded shoulder straps and secure dual zippers.",
    story: "Inspired by Alpine winter journeys and Scandinavian storybooks, this piece transforms traditional woodland fauna into high-fashion embroidery.",
    details: [
      "Artisanal woven reindeer and floral embroidery panel",
      "High-density foam padded back panel for lumbar comfort",
      "Spacious main compartment with book and tech organizer",
      "Dual pullers with leather knotted zip tabs",
      "Anti-theft concealed zip pocket on rear panel"
    ],
    material: "Embroidered Heavyweight Canvas & Calfskin Trim",
    dimensions: "36cm H × 27cm W × 13cm D",
    weight: "640g",
    closure: "Smooth glide gold-tone zip closure",
    interior: "Lustrous protective twill with dual slip slots",
    strap: "Padded adjustable canvas straps",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Gently wipe with dry soft cloth", "Do not machine wash or dry clean", "Keep stuffed when stored"],
    color: "Nordic Cream & Evergreen",
    colors: [
      { name: "Nordic Cream", hex: "#F3ECE1" },
      { name: "Evergreen", hex: "#2E4F3E" }
    ],
    rating: 5.0,
    reviewCount: 29,
    featured: false,
  },
  {
    folder: "begpack/Simba Backpack",
    id: "nishya-simba-backpack",
    name: "The Simba Artisan Backpack",
    slug: "simba-artisan-backpack",
    category: "Backpacks",
    badge: "TRENDING",
    price: 1499,
    originalPrice: 2799,
    tagline: "Savannah Silhouette & Architectural Utility",
    description: "Bold, spirited, and exquisitely constructed. The Simba Artisan Backpack showcases statement illustrative wildlife artistry accented with hand-burnished leather piping and spacious organizers.",
    story: "A celebration of regal wildlife and golden savannah horizons, capturing untamed elegance with modern metropolitan luxury.",
    details: [
      "Signature illustrated wildlife canvas motif",
      "Gusseted front pocket for quick-access passport and essentials",
      "Padded 14-inch laptop partition",
      "Antique brass hardware with protective finish",
      "Heavy-duty reinforced bottom base"
    ],
    material: "Structured Jacquard Canvas & Antique Gold Hardware",
    dimensions: "38cm H × 28cm W × 14cm D",
    weight: "670g",
    closure: "Heavy-duty double metal zip",
    interior: "Tear-resistant canvas lining with dual organizers",
    strap: "Reinforced shoulder straps with padded cushioning",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Clean with soft bristle brush or damp cloth", "Store in cool, dry environment"],
    color: "Savannah Ochre & Earth",
    colors: [
      { name: "Savannah Ochre", hex: "#C68B59" },
      { name: "Earth Umber", hex: "#4A3B32" }
    ],
    rating: 4.9,
    reviewCount: 44,
    featured: true,
  },

  // --- 2. LUXURY HATS ---
  {
    folder: "hat/Berry Belle Hat",
    id: "nishya-berry-belle-hat",
    name: "The Berry Belle Riviera Bucket Hat",
    slug: "berry-belle-hat",
    category: "Hats & Headwear",
    badge: "SUMMER ESSENTIAL",
    price: 899,
    originalPrice: 1599,
    tagline: "Florentine Riviera Sun Silhouette",
    description: "A delightful resort essential crafted in breathable structured canvas with whimsical botanical berry prints. Offers generous UV shade with an architectural downward sloping brim.",
    story: "Designed for sun-drenched afternoons on the Amalfi Coast and Mediterranean sea terraces. Packs effortlessly without losing its crisp sculptural silhouette.",
    details: [
      "Wide sun-shading brim (8cm) for face and neck protection",
      "Breathable moisture-wicking internal cotton sweatband",
      "Packable and crush-resistant construction for travel",
      "Exquisite French-seamed interior finish",
      "Signature Nishya gilded brass logo rivet"
    ],
    material: "100% Breathable Woven Cotton Canvas",
    dimensions: "One Size (56–58cm circumference, 8cm brim)",
    weight: "120g",
    closure: "Slip-on bucket silhouette with internal sizing tie",
    interior: "Soft unlined crown for maximum airflow",
    strap: "Internal adjustable grosgrain drawstring",
    origin: "Handcrafted in Florence, Italy",
    care: ["Gentle hand wash in cold water", "Reshape and flat air dry", "Light steam if necessary"],
    color: "Wildberry & Blush Cream",
    colors: [
      { name: "Wildberry Blush", hex: "#D98880" },
      { name: "Cream White", hex: "#FAF5EF" }
    ],
    rating: 4.8,
    reviewCount: 22,
    featured: false,
  },
  {
    folder: "hat/Midnight Bloom Hat",
    id: "nishya-midnight-bloom-hat",
    name: "The Midnight Bloom Wide-Brim Hat",
    slug: "midnight-bloom-hat",
    category: "Hats & Headwear",
    badge: "ATELIER EXCLUSIVE",
    price: 899,
    originalPrice: 1599,
    tagline: "Nocturnal Flora & Sun-Drenched Elegance",
    description: "Lush botanical florals rendered against deep midnight canvas. Designed for coastal getaways, garden soirees, and sunny city strolls with an effortless silhouette.",
    story: "Evoking midnight strolls through the Boboli Gardens when night-blooming jasmine and Florentine roses perfume the warm Italian air.",
    details: [
      "UPF 50+ UV sun protection rating",
      "Architectural sloping brim that holds its shape",
      "Deep indigo nocturnal botanical print",
      "Breathable organic cotton weave",
      "Foldable design ideal for luxury carry-ons"
    ],
    material: "Artisanal Printed Cotton Canvas",
    dimensions: "One Size (56–58cm circumference, 8.5cm brim)",
    weight: "130g",
    closure: "Slip-on with comfortable flex band",
    interior: "Cotton grosgrain sweatband",
    strap: "Internal ribbon sizer",
    origin: "Handcrafted in Florence, Italy",
    care: ["Spot clean with gentle soap", "Air dry naturally away from direct heat"],
    color: "Midnight Indigo & Floral Gold",
    colors: [
      { name: "Midnight Indigo", hex: "#1C2833" },
      { name: "Petal Amber", hex: "#D4AC0D" }
    ],
    rating: 4.9,
    reviewCount: 31,
    featured: true,
  },
  {
    folder: "hat/Safari Hat",
    id: "nishya-safari-hat",
    name: "The Safari Expedition Sun Hat",
    slug: "safari-expedition-sun-hat",
    category: "Hats & Headwear",
    badge: "RESORT COLLECTION",
    price: 899,
    originalPrice: 1599,
    tagline: "Sub-Saharan Flora & Sun Protection",
    description: "Capturing the untamed elegance of the Serengeti, The Safari Sun Hat features earthy wildlife and foliage motifs on a durable sun-shielding canvas.",
    story: "Created for adventurous spirits who demand elegance under the sun, whether navigating remote trails or relaxing by turquoise waters.",
    details: [
      "Wide structured brim with multi-row reinforcement stitching",
      "Ventilated brass side eyelets for breeze circulation",
      "Removable wind cord with genuine leather toggle",
      "Earthy wildlife foliage print with antique tone",
      "Sweat-wicking interior band"
    ],
    material: "100% Organic Woven Canvas",
    dimensions: "One Size (56–58cm circumference, 8.5cm brim)",
    weight: "125g",
    closure: "Slip-on with adjustable chin cord",
    interior: "Lightweight canvas sweatband",
    strap: "Detachable woven chin cord with leather stopper",
    origin: "Handcrafted in Florence, Italy",
    care: ["Brush off dust gently", "Hand wash cold if soiled"],
    color: "Desert Sand & Olive Palm",
    colors: [
      { name: "Desert Sand", hex: "#E5D3B3" },
      { name: "Olive Palm", hex: "#556B2F" }
    ],
    rating: 4.8,
    reviewCount: 27,
    featured: false,
  },

  // --- 3. LAPTOP BAGS ---
  {
    folder: "Laptop begs/Aster Laptop Bag",
    id: "nishya-aster-laptop-bag",
    name: "The Aster Quilted Laptop Briefcase",
    slug: "aster-quilted-laptop-bag",
    category: "Laptop Bags",
    badge: "BESTSELLER",
    price: 1399,
    originalPrice: 2499,
    tagline: "Floral Geometry & Shock-Absorbing Protection",
    description: "Precision-cushioned for 13-to-15-inch MacBooks and ultrabooks. The Aster Laptop Briefcase pairs quilted aster floral detailing with high-density neoprene core and detachable crossbody strap.",
    story: "Inspired by classic Florentine marquetry, each quilted aster pattern creates protective air pockets that insulate your prized device against sudden impacts.",
    details: [
      "Fits all 13-inch, 14-inch, and slim 15-inch laptops (MacBook Pro / Air)",
      "High-density 8mm memory foam shock absorption",
      "Plush velvet scratch-free inner lining",
      "Concealed exterior zip pocket for charger, mouse, and adapter",
      "Detachable padded shoulder strap with swivel metal hooks"
    ],
    material: "Quilted Shockproof Canvas & Gold-Tone Hardware",
    dimensions: "39cm W × 29cm H × 4cm D",
    weight: "510g",
    closure: "Dual smooth-glide gold metal zippers",
    interior: "Ultra-soft microvelour with protective corner bumpers",
    strap: "Detachable, adjustable woven shoulder strap (80cm – 140cm)",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Wipe clean with microfiber cloth", "Avoid soaking in liquid"],
    color: "Pastel Blossom & Cloud Grey",
    colors: [
      { name: "Pastel Blossom", hex: "#E8D8D8" },
      { name: "Cloud Grey", hex: "#BDC3C7" }
    ],
    rating: 5.0,
    reviewCount: 52,
    featured: true,
  },
  {
    folder: "Laptop begs/CheckMate Laptop Bag",
    id: "nishya-checkmate-laptop-bag",
    name: "The CheckMate Architectural Laptop Bag",
    slug: "checkmate-architectural-laptop-bag",
    category: "Laptop Bags",
    badge: "MODERN ICON",
    price: 1399,
    originalPrice: 2499,
    tagline: "Modernist Gingham & Plush Tech Shield",
    description: "Timeless checkered symmetry meets plush high-protection cushioning. Built with water-resistant exterior treatment and dedicated slots for chargers, stylus, and documents.",
    story: "Drawing from modernist Italian graphic design and Milanese business chic, The CheckMate elevates the humble tech carrier into a sophisticated accessory.",
    details: [
      "Cushioned laptop chamber with secure velcro retainer band",
      "Dual top handles with comfortable leather hand wrap",
      "Front zippered organizational pocket with pen slots",
      "Luggage trolley strap on back for seamless airport travel",
      "Custom gunmetal & gold dual-tone hardware"
    ],
    material: "Structured Woven Gingham & Leather Accents",
    dimensions: "40cm W × 29.5cm H × 4.5cm D",
    weight: "520g",
    closure: "Full opening top zipper",
    interior: "Padded tech compartment with accessory slots",
    strap: "Detachable nylon web shoulder strap",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Spot clean exterior with soft cloth", "Do not bleach"],
    color: "Monochrome Noir & Pearl Check",
    colors: [
      { name: "Monochrome Noir", hex: "#2C3E50" },
      { name: "Pearl White", hex: "#ECF0F1" }
    ],
    rating: 4.9,
    reviewCount: 46,
    featured: false,
  },
  {
    folder: "Laptop begs/Moon Night Laptop Bag (small)",
    id: "nishya-moon-night-laptop-bag",
    name: "The Moon Night Compact Laptop Sleeve",
    slug: "moon-night-compact-laptop-bag",
    category: "Laptop Bags",
    badge: "SLEEK & SLIM",
    price: 1399,
    originalPrice: 2499,
    tagline: "Celestial Silhouettes for 13\" Devices",
    description: "Slimline and sculptural, designed specifically for 13-inch laptops, iPad Pros, and compact notebooks. Features celestial nocturnal print and ultra-soft velour interior lining.",
    story: "Crafted for creative nomads who travel light. Captures the serenity of twilight under the Tuscan sky in an ultra-sleek protective sleeve.",
    details: [
      "Engineered for 13-inch MacBook Air/Pro, iPad Pro 12.9\", and ultrabooks",
      "Ultra-slim profile easily slides into larger totes and backpacks",
      "Corner protection technology shields device edges",
      "Soft brushed velour prevents scuffs and scratches",
      "Water-repellent coated exterior canvas"
    ],
    material: "Water-Repellent Nocturnal Canvas & Velour Cushioning",
    dimensions: "34cm W × 25cm H × 3.5cm D",
    weight: "390g",
    closure: "Minimalist top zip with leather pull",
    interior: "Thick fleece lining with edge protection piping",
    strap: "Retractable grab handles that fold flat into slip pockets",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Wipe with damp cloth", "Store flat"],
    color: "Midnight Eclipse & Starlight",
    colors: [
      { name: "Midnight Navy", hex: "#1A252F" },
      { name: "Starlight Gold", hex: "#F4D03F" }
    ],
    rating: 4.9,
    reviewCount: 39,
    featured: false,
  },
  {
    folder: "Laptop begs/Snow bow Laptop Bag",
    id: "nishya-snow-bow-laptop-bag",
    name: "The Snow Bow Quilted Laptop Carrier",
    slug: "snow-bow-quilted-laptop-bag",
    category: "Laptop Bags",
    badge: "NEW ARRIVAL",
    price: 1399,
    originalPrice: 2499,
    tagline: "Feminine Charm & Professional Protection",
    description: "Adorned with delicate bow motifs and plush cloud quilting. Features dual top handles, detachable shoulder strap, and multi-pocket interior organizer.",
    story: "Bringing softness and poetic charm to modern tech accessories. Designed for women who appreciate delicate detailing without sacrificing heavy-duty protection.",
    details: [
      "Quilted cloud padding with embroidered miniature bows",
      "Accommodates up to 14-inch laptops and large tablets",
      "Soft padded handles for comfortable hand carriage",
      "Dual internal slip pockets for phone, mouse, and ear pods",
      "Gleaming 18k gold-finish zip pullers"
    ],
    material: "Soft Touch Quilted Canvas & Satin Webbing",
    dimensions: "39cm W × 29cm H × 4cm D",
    weight: "490g",
    closure: "Smooth dual metal zip opening",
    interior: "Cushioned velvet lining with device retention elastic",
    strap: "Adjustable and removable tonal shoulder strap",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Gentle hand wipe", "Keep away from sharp metal objects"],
    color: "Powder Blue & Snow White",
    colors: [
      { name: "Powder Blue", hex: "#A9CCE3" },
      { name: "Snow White", hex: "#FBFCFC" }
    ],
    rating: 5.0,
    reviewCount: 34,
    featured: true,
  },

  // --- 4. POUCH BAGS / CLUTCHES ---
  {
    folder: "pouch begs/Belu Pouch Bag",
    id: "nishya-belu-pouch-bag",
    name: "The Belu Quilted Vanity Pouch",
    slug: "belu-quilted-vanity-pouch",
    category: "Clutches",
    badge: "EVERYDAY ESSENTIAL",
    price: 799,
    originalPrice: 1299,
    tagline: "Compact Quilted Beauty & Tech Pouch",
    description: "The quintessential travel companion for cosmetics, grooming essentials, or tech cables. Diamond-quilted with easy-wipe waterproof lining and gold-accented zipper.",
    story: "Designed as an organic companion to our Belu backpack collection, keeping everyday makeup, jewelry, and daily treasures pristine.",
    details: [
      "Generous gusseted base stands upright on dressers and vanity tables",
      "Waterproof, wipe-clean interior lining for spill safety",
      "Interior elasticized pocket for lipsticks and compact mirror",
      "Sturdy gold-tone zipper with leather pull",
      "Lightweight and easily tucks into any handbag"
    ],
    material: "Diamond-Quilted Canvas & Water-Resistant Lining",
    dimensions: "22cm W × 14cm H × 8cm D",
    weight: "140g",
    closure: "Top zip closure with leather tab",
    interior: "Water-resistant satin lining with side slip pocket",
    strap: "Side wristlet loop for easy handheld carrying",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Wipe interior with damp cloth", "Air dry open"],
    color: "Botanical Slate",
    colors: [
      { name: "Botanical Slate", hex: "#7A8288" },
      { name: "Natural Ecru", hex: "#EAECEE" }
    ],
    rating: 4.8,
    reviewCount: 41,
    featured: false,
  },
  {
    folder: "pouch begs/Blush Pouch Bag",
    id: "nishya-blush-pouch-bag",
    name: "The Blush Heart Stripe Quilted Pouch",
    slug: "blush-heart-stripe-pouch",
    category: "Clutches",
    badge: "BESTSELLER",
    price: 799,
    originalPrice: 1299,
    tagline: "Playful Romantic Stripes & Golden Accents",
    description: "Romance meets everyday elegance. Featuring sweet heart and stripe quilting, this tactile pouch slips seamlessly into your larger Nishya tote or stands chic as an evening clutch.",
    story: "A tender tribute to Venetian romance. The contrast between bold candy stripes and delicate embroidered hearts exudes youthful luxury.",
    details: [
      "Fine quilted heart and linear stripe embroidery",
      "Soft padded touch for fragile makeup compacts and perfumes",
      "Smooth metal zipper that glides effortlessly",
      "Stands upright with wide supportive bottom gusset",
      "Golden Nishya foil emblem"
    ],
    material: "100% Quilted Cotton & Satin Lining",
    dimensions: "23cm W × 15cm H × 8cm D",
    weight: "150g",
    closure: "Gold-tone zip with heart-embossed puller",
    interior: "Soft pink satin lining with elastic organizer",
    strap: "Detachable leather wristlet strap",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Spot clean with mild soapy water", "Air dry flat"],
    color: "Blush Rose & Crimson Accent",
    colors: [
      { name: "Blush Rose", hex: "#FADBD8" },
      { name: "Crimson Stripe", hex: "#C0392B" }
    ],
    rating: 5.0,
    reviewCount: 63,
    featured: true,
  },
  {
    folder: "pouch begs/Sunheart Pouch Bag",
    id: "nishya-sunheart-pouch-bag",
    name: "The Sunheart Riviera Pouch",
    slug: "sunheart-riviera-pouch",
    category: "Clutches",
    badge: "RESORT COLLECTION",
    price: 799,
    originalPrice: 1299,
    tagline: "Warm Solar Motifs & Artisanal Stitching",
    description: "Radiating warm Mediterranean sunshine energy, The Sunheart Pouch provides generous storage for vanity must-haves, jewelry, and passports.",
    story: "Inspired by the terracotta tile rooftops and sun-soaked coastlines of Sicily, capturing boundless optimism in radiant golden amber.",
    details: [
      "Solar burst and geometric heart print",
      "Structured base keeps cosmetics organized without tumbling",
      "Gold-tone zipper teeth with smooth nylon teeth slider",
      "Washable stain-resistant lining",
      "Compact yet deceptive high-capacity interior"
    ],
    material: "Printed Natural Canvas & Brass Zip",
    dimensions: "22cm W × 14cm H × 7.5cm D",
    weight: "135g",
    closure: "Gold zip closure",
    interior: "Easy-clean water-repellent interior",
    strap: "Handy side loop",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Spot clean exterior", "Do not tumble dry"],
    color: "Amber Gold & Terracotta",
    colors: [
      { name: "Amber Gold", hex: "#F39C12" },
      { name: "Terracotta", hex: "#D35400" }
    ],
    rating: 4.8,
    reviewCount: 29,
    featured: false,
  },
  {
    folder: "pouch begs/Tropical Pouch Bag",
    id: "nishya-tropical-pouch-bag",
    name: "The Tropical Palm Vanity Clutch",
    slug: "tropical-palm-vanity-clutch",
    category: "Clutches",
    badge: "LIMITED EDITION",
    price: 799,
    originalPrice: 1299,
    tagline: "Exotic Foliage & Handcrafted Luxury",
    description: "Transport yourself to a lush coastal retreat with lush palm prints, durable reinforced base, and smooth metal zipper with leather pull tab.",
    story: "Evoking botanical conservatories and verdant island escapes, designed to hold sunscreen, skincare, or evening cocktails essentials.",
    details: [
      "Lush palm foliage print on textured canvas",
      "Heavy-duty waterproof lining protects against cosmetic leaks",
      "Spacious enough for full-sized makeup brushes and palettes",
      "Dual interior side pouches",
      "Polished gold hardware"
    ],
    material: "Organic Heavyweight Canvas & Waterproof Lining",
    dimensions: "23cm W × 15cm H × 8cm D",
    weight: "145g",
    closure: "Metal zip with genuine leather pull",
    interior: "Wipe-clean waterproof nylon interior",
    strap: "Tonal side carry handle",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Wipe clean with moist sponge", "Air dry"],
    color: "Emerald Palm & Ivory",
    colors: [
      { name: "Emerald Palm", hex: "#196F3D" },
      { name: "Ivory Canvas", hex: "#FDFEFE" }
    ],
    rating: 4.9,
    reviewCount: 35,
    featured: false,
  },

  // --- 5. SLING BAGS ---
  {
    folder: "slingbegs/Cobalt Sling Bag",
    id: "nishya-cobalt-sling-bag",
    name: "The Cobalt Arch Crossbody Sling",
    slug: "cobalt-arch-crossbody-sling",
    category: "Sling Bags",
    badge: "TRENDING",
    price: 1199,
    originalPrice: 2199,
    tagline: "Electric Azure & Hands-Free Florentine Chic",
    description: "A vibrant cobalt silhouette tailored for dynamic urban lifestyle. Features adjustable webbing strap, quick-access exterior slip pocket, and secure zip closure.",
    story: "Engineered for free-spirited city exploration. The striking cobalt hue commands attention while the ergonomic crescent shape rests effortlessly across your torso.",
    details: [
      "Hands-free crossbody or waist-bag styling options",
      "Curved ergonomic shape hugs your silhouette naturally",
      "Roomy main compartment holds phone, wallet, keys, and lip balm",
      "Rear anti-theft zip pocket rests safely against body",
      "Wide comfortable jacquard strap with quick-release metal clip"
    ],
    material: "Water-Resistant Jacquard & Florentine Leather Accents",
    dimensions: "25cm W × 18cm H × 7cm D",
    weight: "320g",
    closure: "Top zip closure with leather toggle",
    interior: "Durable microfiber lining with card slots",
    strap: "Adjustable woven crossbody strap (65cm – 120cm)",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Spot clean with mild damp cloth", "Store in dustbag when not in use"],
    color: "Cobalt Azure & Noir",
    colors: [
      { name: "Cobalt Azure", hex: "#1F618D" },
      { name: "Jet Noir", hex: "#17202A" }
    ],
    rating: 4.9,
    reviewCount: 47,
    featured: true,
  },
  {
    folder: "slingbegs/Freya pink Sling Bag",
    id: "nishya-freya-pink-sling-bag",
    name: "The Freya Rose Crescent Sling",
    slug: "freya-rose-crescent-sling",
    category: "Sling Bags",
    badge: "BESTSELLER",
    price: 1199,
    originalPrice: 2199,
    tagline: "Soft Rose Aesthetic & Sculptural Crescent Silhouette",
    description: "Graceful and lightweight, The Freya Rose Sling hugs the torso with ergonomic perfection. Finished in delicate dusty rose with polished gold clasp.",
    story: "Named after the Nordic goddess of beauty and love, The Freya is an ode to understated femininity and modern mobility.",
    details: [
      "Crescent crescent arch silhouette for all-day comfort",
      "Soft padded touch with quilted tonal stitching",
      "Internal zippered pocket and dual slip compartments",
      "Gold-tone swivel clips allow flexible strap positioning",
      "Perfect for day-to-night styling"
    ],
    material: "Plush Quilted Canvas & 18k Gilded Hardware",
    dimensions: "26cm W × 17cm H × 7.5cm D",
    weight: "310g",
    closure: "Gold-tone zip opening with branded charm",
    interior: "Lustrous rose twill with leather card sleeve",
    strap: "Adjustable tonal webbing strap (70cm – 125cm)",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Keep away from dark unwashed denims to avoid color transfer", "Spot clean"],
    color: "Freya Rose & Champagne",
    colors: [
      { name: "Freya Rose", hex: "#F5B7B1" },
      { name: "Champagne Gold", hex: "#FAD7A0" }
    ],
    rating: 5.0,
    reviewCount: 58,
    featured: true,
  },
  {
    folder: "slingbegs/Gardenia Sling Bag",
    id: "nishya-gardenia-sling-bag",
    name: "The Gardenia Botanical Sling Bag",
    slug: "gardenia-botanical-sling-bag",
    category: "Sling Bags",
    badge: "ARTISANAL PIECE",
    price: 1199,
    originalPrice: 2199,
    tagline: "Intricate Gardenia Florals & Compact Utility",
    description: "Delicate botanical gardenia prints set against serene neutral grounds. Features wide comfortable shoulder strap and secure zip entry.",
    story: "Hand-painted gardenia blooms immortalized on tactile heavyweight canvas, celebrating the enduring charm of Italian flora.",
    details: [
      "Original Nishya botanical gardenia print",
      "Wide woven canvas strap distributes weight smoothly",
      "Reinforced base and side piping keep structure intact",
      "Exterior front zip pocket for transit card and lipstick",
      "Premium brass zippers with antique luster"
    ],
    material: "Fine Woven Floral Canvas & Calfskin Trim",
    dimensions: "25cm W × 18cm H × 7cm D",
    weight: "325g",
    closure: "Curved zip entry for easy access",
    interior: "Sage green cotton lining with phone slip pocket",
    strap: "Adjustable shoulder strap with brass slider",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Spot clean with gentle fabric cleaner", "Store flat"],
    color: "Gardenia Blossom & Sage",
    colors: [
      { name: "Gardenia Blossom", hex: "#F9EBEA" },
      { name: "Sage Olive", hex: "#A9DFBF" }
    ],
    rating: 4.8,
    reviewCount: 33,
    featured: false,
  },
  {
    folder: "slingbegs/Sunshine Sling Bag",
    id: "nishya-sunshine-sling-bag",
    name: "The Sunshine Radiant Sling Bag",
    slug: "sunshine-radiant-sling-bag",
    category: "Sling Bags",
    badge: "SUMMER DROP",
    price: 1199,
    originalPrice: 2199,
    tagline: "Golden Hour Vibrancy & Effortless Styling",
    description: "Infused with radiant warmth, The Sunshine Sling illuminates any casual or vacation ensemble with cheerful artisan prints and multi-pocket organization.",
    story: "Capturing the golden hour over the River Arno in Florence, when warm amber light bathes ancient stone arches in pure magic.",
    details: [
      "Radiant sunbeam and geometric artisan motif",
      "Lightweight ergonomic build minimizes neck and shoulder strain",
      "Padded interior lining protects smartphones and sunglasses",
      "Quick-release metal buckle for effortless unlatching",
      "Weather-resistant fabric finish"
    ],
    material: "Printed Heavyweight Cotton Canvas",
    dimensions: "25cm W × 18cm H × 7cm D",
    weight: "315g",
    closure: "Smooth top zip closure",
    interior: "Warm mustard twill lining with zip pocket",
    strap: "Adjustable crossbody webbing strap",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Wipe clean with moist cloth", "Do not submerge"],
    color: "Sunshine Gold & Warm Taupe",
    colors: [
      { name: "Sunshine Gold", hex: "#F4D03F" },
      { name: "Warm Taupe", hex: "#B2BABB" }
    ],
    rating: 4.9,
    reviewCount: 36,
    featured: false,
  },

  // --- 6. TOTE BAGS ---
  {
    folder: "totebegs/Aqua Bloom Tote",
    id: "nishya-aqua-bloom-tote",
    name: "The Aqua Bloom Grande Tote",
    slug: "aqua-bloom-grande-tote",
    category: "Totes",
    badge: "SIGNATURE PIECE",
    price: 1599,
    originalPrice: 2999,
    tagline: "Lush Aquamarine Florals & Expansive Everyday Luxury",
    description: "Generously proportioned to carry your 15-inch laptop, planner, water flask, and daily essentials with effortless elegance. Reinforced double shoulder handles ensure all-day comfort.",
    story: "An ode to the coastal Mediterranean waters meeting blossoming cliffside gardens. Built to transition seamlessly from boardroom presentations to weekend escapes.",
    details: [
      "Easily fits 15-inch laptop, tablet, notebooks, and gym change",
      "Reinforced double-stitched leather shoulder straps (25cm drop)",
      "Structured base with protective bottom panel",
      "Interior magnetic snap bridge closure",
      "Internal zip pocket plus dual smartphone slip slots"
    ],
    material: "Artisanal Heavy Canvas & Reinforced Italian Leather Handles",
    dimensions: "42cm W × 32cm H × 14cm D (25cm handle drop)",
    weight: "580g",
    closure: "Magnetic bridge snap clasp and internal security zip",
    interior: "Heavyweight cotton twill with key leash and organizer pockets",
    strap: "Dual long shoulder handles in burnished calfskin",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Spot clean exterior with soft cloth", "Store with stuffing to maintain shape"],
    color: "Aqua Marine & Petal Bloom",
    colors: [
      { name: "Aqua Marine", hex: "#5499C7" },
      { name: "Petal Pink", hex: "#F5B7B1" }
    ],
    rating: 5.0,
    reviewCount: 64,
    featured: true,
  },
  {
    folder: "totebegs/Flora Tote Bag",
    id: "nishya-flora-tote-bag",
    name: "The Flora Botanical Arch Tote",
    slug: "flora-botanical-arch-tote",
    category: "Totes",
    badge: "BESTSELLER",
    price: 1599,
    originalPrice: 2999,
    tagline: "Romantic Italian Meadow & Reinforced Utility",
    description: "A love letter to Florentine gardens. Handcrafted with high-density botanical canvas and deep interior organizer pockets with key leash.",
    story: "Celebrating the legendary wildflower gardens of Tuscany. Rich floral bouquets are printed using archival eco-pigments that retain their brilliance for years.",
    details: [
      "Accommodates up to 15.6-inch laptops with ease",
      "Wide supportive shoulder straps eliminate shoulder digging",
      "Reinforced brass rivet hardware at all stress points",
      "Deep interior zippered pouch for passport and wallet",
      "Flat reinforced base keeps tote standing upright on floors"
    ],
    material: "Heavy Cotton Canvas & Burnished Leather Straps",
    dimensions: "43cm W × 33cm H × 15cm D",
    weight: "590g",
    closure: "Top magnetic clasp with interior zip pouch",
    interior: "Soft natural cotton lining with leather Nishya crest",
    strap: "Comfort-rolled leather shoulder straps",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Clean with soft brush and cool water", "Do not iron leather handles"],
    color: "Flora Meadow Multi",
    colors: [
      { name: "Flora Meadow", hex: "#52BE80" },
      { name: "Tuscan Ochre", hex: "#F5B041" }
    ],
    rating: 4.9,
    reviewCount: 51,
    featured: false,
  },
  {
    folder: "totebegs/Nish Gul Tote Bag",
    id: "nishya-nish-gul-tote-bag",
    name: "The Nish Gul Heritage Tote",
    slug: "nish-gul-heritage-tote",
    category: "Totes",
    badge: "HERITAGE EDITION",
    price: 1599,
    originalPrice: 2999,
    tagline: "Signature Nishya Gul Blossom Artistry",
    description: "A signature Nishya emblem piece. The Nish Gul Tote captures heritage floral motifs with refined contemporary lines, magnetic snap closure, and structured bottom panel.",
    story: "'Gul'—the eternal blossom. This flagship creation brings Mughal botanical court art into dialogue with Italian leather craftsmanship.",
    details: [
      "Signature Nish Gul heritage floral print",
      "Plush padded walls protect laptops and fragile belongings",
      "Solid cast brass hardware with antique patina",
      "Dedicated sleeve for water flask and umbrella",
      "Signature Nishya engraved metal bag charm included"
    ],
    material: "Structured Jacquard & Premium Vegetable Tanned Leather",
    dimensions: "42cm W × 33cm H × 14.5cm D",
    weight: "600g",
    closure: "Concealed magnetic snap closure",
    interior: "Lustrous jacquard lining with multiple organizer dividers",
    strap: "Sturdy tubular leather handles (26cm drop)",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Use leather conditioner on straps annually", "Keep in dustbag"],
    color: "Nish Gul Crimson & Ecru",
    colors: [
      { name: "Gul Crimson", hex: "#922B21" },
      { name: "Ivory Ecru", hex: "#FDFEFE" }
    ],
    rating: 5.0,
    reviewCount: 72,
    featured: true,
  },
  {
    folder: "totebegs/Safari Tote Bag",
    id: "nishya-safari-tote-bag",
    name: "The Safari Expedition Grande Tote",
    slug: "safari-expedition-grande-tote",
    category: "Totes",
    badge: "LIMITED EDITION",
    price: 1599,
    originalPrice: 2999,
    tagline: "Untamed Savannah & Roomy Daily Transit",
    description: "Equally magnificent on weekend retreats or daily office commutes. The Safari Tote pairs rich exotic print with sturdy, reinforced base feet and premium brass rivets.",
    story: "Designed for wanderers with discerning taste. Combines the rugged durability of expedition canvas with the refined luxury of Florentine calfskin.",
    details: [
      "Expansive main cabin accommodates weekend clothes or heavy tech stack",
      "Antique brass base studs prevent floor scuffing",
      "Exterior slide pocket for quick boarding pass and phone access",
      "Double reinforced cross-stitched handles",
      "Tuck-in top zip closure keeps contents private and secure"
    ],
    material: "High-Density Canvas & Tuscan Leather Trim",
    dimensions: "44cm W × 34cm H × 15cm D",
    weight: "610g",
    closure: "Recessed full-length top zipper",
    interior: "Rugged waterproof canvas lining with dual organizers",
    strap: "Heavyweight leather handles designed for shoulder carry",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Wipe clean with moist sponge", "Air dry thoroughly"],
    color: "Safari Sand & Wilderness Khaki",
    colors: [
      { name: "Safari Sand", hex: "#E5D3B3" },
      { name: "Wilderness Khaki", hex: "#7D6608" }
    ],
    rating: 4.9,
    reviewCount: 43,
    featured: false,
  },

  // --- 7. YOGA & GYM DUFFLES ---
  {
    folder: "yoga/Midnight Bloom Yoga-Gym Bag",
    id: "nishya-midnight-bloom-yoga-duffle",
    name: "The Midnight Bloom Wellness & Yoga Duffle",
    slug: "midnight-bloom-wellness-yoga-duffle",
    category: "Yoga & Gym Bags",
    badge: "WELLNESS LUXURY",
    price: 1699,
    originalPrice: 3199,
    tagline: "Integrated Mat Straps & Nocturnal Floral Silhouette",
    description: "The ultimate luxury wellness carrier. Engineered with exterior adjustable buckles to secure your yoga mat, ventilated shoe compartment, water-bottle pocket, and roomy central cavity.",
    story: "For the mindful practitioner who refuses to compromise on elegance. Transitions seamlessly from early morning vinyasa flow to afternoon executive meetings.",
    details: [
      "Dedicated exterior adjustable straps to carry any yoga or pilates mat",
      "Separate zippered side shoe compartment with dual ventilation eyelets",
      "Water-resistant interior holds gym apparel and toiletries safely",
      "Interior zip pocket for jewelry, watch, and locker padlock",
      "Padded removable shoulder strap with non-slip pad"
    ],
    material: "Water-Repellent Woven Canvas & Padded Shoulder Strap",
    dimensions: "48cm L × 26cm W × 27cm H",
    weight: "720g",
    closure: "Dual heavy-duty metal zip opening",
    interior: "Easy-wipe water-resistant nylon with wet/dry pocket",
    strap: "Dual padded carry handles + detachable adjustable shoulder strap",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Wipe down with antibacterial cloth", "Air out after gym use"],
    color: "Midnight Bloom & Brushed Gold",
    colors: [
      { name: "Midnight Navy", hex: "#1B2631" },
      { name: "Brushed Gold", hex: "#D4AC0D" }
    ],
    rating: 5.0,
    reviewCount: 48,
    featured: true,
  },
  {
    folder: "yoga/Scarlet Palm Yoga-Gym Bag",
    id: "nishya-scarlet-palm-yoga-duffle",
    name: "The Scarlet Palm Active Duffle & Yoga Bag",
    slug: "scarlet-palm-active-duffle-yoga-bag",
    category: "Yoga & Gym Bags",
    badge: "NEW ARRIVAL",
    price: 1699,
    originalPrice: 3199,
    tagline: "Tropical Energy & Professional Studio Transit",
    description: "Make every studio entrance unforgettable. Features scarlet tropical foliage, reinforced yoga mat carrier loops, multi-pocket wet/dry organizer, and luggage sleeve for travel.",
    story: "Infused with tropical vitality. Designed for high performers whose wellness journey includes cross-country weekend retreats and daily studio workouts.",
    details: [
      "Quick-release yoga mat straps hold standard or extra-thick mats securely",
      "Side wet-pocket for post-workout damp gear or swimwear",
      "Back luggage trolley sleeve slides over suitcase handles",
      "Reinforced heavy-load base with protective studs",
      "Ultra-durable, scratch-resistant tropical jacquard"
    ],
    material: "Heavy-Duty Quilted Canvas & Nylon Ripstop Interior",
    dimensions: "48cm L × 26cm W × 27cm H",
    weight: "730g",
    closure: "Wide U-shaped dual zip opening for easy packing",
    interior: "Multi-compartment organizer with water-resistant coating",
    strap: "Reinforced grip handles with velcro wrap + padded shoulder strap",
    origin: "Handcrafted in Florence, Italy & Mumbai Atelier",
    care: ["Spot clean exterior with mild soap", "Keep zippers lubricated"],
    color: "Scarlet Tropical & Jet Noir",
    colors: [
      { name: "Scarlet Palm", hex: "#900C3F" },
      { name: "Jet Noir", hex: "#1C1C1C" }
    ],
    rating: 4.9,
    reviewCount: 41,
    featured: true,
  },
];

async function ensureCategories() {
  console.log("Ensuring categories exist in Supabase categories table...");
  const categoriesToAdd = [
    {
      name: "Laptop Bags",
      slug: "laptop-bags",
      description: "Artisanal shockproof laptop briefcases & quilted sleeves",
      sort_order: 1,
      is_visible: true,
      image: "/images/nishya/carry_your_story_pink_arch.jpg",
    },
    {
      name: "Totes",
      slug: "totes",
      description: "Expansive everyday luxury totes in Italian canvas & calfskin",
      sort_order: 2,
      is_visible: true,
      image: "/images/nishya/carry_your_story_pink_arch.jpg",
    },
    {
      name: "Sling Bags",
      slug: "sling-bags",
      description: "Versatile crescent and crossbody silhouettes for hands-free chic",
      sort_order: 3,
      is_visible: true,
      image: "/images/nishya/carry_your_story_pink_arch.jpg",
    },
    {
      name: "Backpacks",
      slug: "backpacks",
      description: "Ergonomic quilted backpacks with dual-compartment tech organizers",
      sort_order: 4,
      is_visible: true,
      image: "/images/nishya/carry_your_story_pink_arch.jpg",
    },
    {
      name: "Clutches",
      slug: "clutches",
      description: "Vanity pouches, cosmetic organizers, and evening clutches",
      sort_order: 5,
      is_visible: true,
      image: "/images/nishya/carry_your_story_pink_arch.jpg",
    },
    {
      name: "Yoga & Gym Bags",
      slug: "yoga-gym-bags",
      description: "Active luxury duffles with integrated yoga mat straps",
      sort_order: 6,
      is_visible: true,
      image: "/images/nishya/carry_your_story_pink_arch.jpg",
    },
    {
      name: "Hats & Headwear",
      slug: "hats-headwear",
      description: "Florentine Riviera bucket hats and wide-brim sun protection",
      sort_order: 7,
      is_visible: true,
      image: "/images/nishya/carry_your_story_pink_arch.jpg",
    },
  ];

  for (const cat of categoriesToAdd) {
    const { error } = await supabase
      .from("categories")
      .upsert(cat, { onConflict: "slug" });
    if (error) {
      console.warn(`Category upsert notice for ${cat.name}:`, error.message);
    }
  }
  console.log("Categories checked and synchronized.");
}

async function uploadFileToSupabase(localFilePath, storagePath, mimeType) {
  const fileBuffer = fs.readFileSync(localFilePath);
  const { data, error } = await supabase.storage
    .from("product-media")
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    console.error(`Storage upload error for ${storagePath}:`, error.message);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from("product-media")
    .getPublicUrl(storagePath);

  return publicUrlData.publicUrl;
}

async function processProduct(prod, index, total) {
  console.log(`\n[${index + 1}/${total}] Processing: ${prod.name}...`);
  const folderPath = path.join(BASE_SOURCE_DIR, prod.folder);

  if (!fs.existsSync(folderPath)) {
    console.warn(`Directory not found: ${folderPath}`);
    return;
  }

  // Local destination folder in public/images/products/<slug>/
  const localProductDir = path.join(PUBLIC_PRODUCTS_DIR, prod.slug);
  if (!fs.existsSync(localProductDir)) {
    fs.mkdirSync(localProductDir, { recursive: true });
  }

  const files = fs
    .readdirSync(folderPath)
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));

  if (files.length === 0) {
    console.warn(`No image files in ${folderPath}`);
    return;
  }

  // Sort files so clean studio renders (file_000... or Gemini...) come first
  files.sort((a, b) => {
    const aIsRender = a.startsWith("file_") || a.startsWith("Gemini_");
    const bIsRender = b.startsWith("file_") || b.startsWith("Gemini_");
    if (aIsRender && !bIsRender) return -1;
    if (!aIsRender && bIsRender) return 1;
    return a.localeCompare(b);
  });

  const uploadedUrls = [];
  const localUrls = [];

  for (let i = 0; i < files.length; i++) {
    const fileName = files[i];
    const sourceFilePath = path.join(folderPath, fileName);
    const ext = path.extname(fileName).toLowerCase();
    const cleanFileName = `${i + 1}${ext}`;
    const localDestPath = path.join(localProductDir, cleanFileName);

    // 1. Copy locally to public/images/products/<slug>/<cleanFileName>
    fs.copyFileSync(sourceFilePath, localDestPath);
    localUrls.push(`/images/products/${prod.slug}/${cleanFileName}`);

    // 2. Upload to Supabase Storage
    const mimeType = ext === ".png" ? "image/png" : "image/jpeg";
    const storagePath = `products/${prod.slug}/${cleanFileName}`;
    try {
      const publicUrl = await uploadFileToSupabase(sourceFilePath, storagePath, mimeType);
      if (publicUrl) {
        uploadedUrls.push(publicUrl);
      } else {
        uploadedUrls.push(`/images/products/${prod.slug}/${cleanFileName}`);
      }
    } catch (e) {
      console.error(`Upload failed for ${fileName}, falling back to local path:`, e.message);
      uploadedUrls.push(`/images/products/${prod.slug}/${cleanFileName}`);
    }
  }

  // Determine primary, secondary, and gallery
  const primaryImage = uploadedUrls[0] || localUrls[0];
  const secondaryImage = uploadedUrls[1] || localUrls[1] || primaryImage;
  const gallery = uploadedUrls.length > 0 ? uploadedUrls : localUrls;

  // Prepare database row
  const dbRow = {
    id: prod.id,
    name: prod.name,
    slug: prod.slug,
    tagline: prod.tagline,
    price: prod.price,
    original_price: prod.originalPrice,
    image: primaryImage,
    secondary_image: secondaryImage,
    gallery: gallery,
    category: prod.category,
    badge: prod.badge,
    description: prod.description,
    story: prod.story,
    details: prod.details,
    care: prod.care,
    material: prod.material,
    dimensions: prod.dimensions,
    weight: prod.weight,
    closure: prod.closure,
    interior: prod.interior,
    strap: prod.strap,
    sku: `NIS-${prod.slug.toUpperCase().slice(0, 10)}-2026`,
    origin: prod.origin,
    color: prod.color,
    colors: prod.colors,
    rating: prod.rating,
    review_count: prod.reviewCount,
    in_stock: true,
    stock_quantity: 25,
    featured: prod.featured,
    status: "published",
    updated_at: new Date().toISOString(),
  };

  const { error: upsertError } = await supabase
    .from("products")
    .upsert(dbRow, { onConflict: "id" });

  if (upsertError) {
    console.error(`Database upsert error for ${prod.name}:`, upsertError.message);
  } else {
    console.log(`✓ Uploaded & Published: ${prod.name} (Price: ₹${prod.price}, Images: ${gallery.length})`);
  }
}

async function run() {
  console.log("=== NISHYA LUXURY PRODUCT IMPORTER ===");
  console.log(`Total Products to Import: ${productsCatalog.length}`);

  await ensureCategories();

  for (let i = 0; i < productsCatalog.length; i++) {
    await processProduct(productsCatalog[i], i, productsCatalog.length);
  }

  console.log("\n==========================================");
  console.log("All 24 products imported successfully!");
  console.log("==========================================");
}

run().catch(console.error);
