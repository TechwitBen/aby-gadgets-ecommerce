//  FOR BUILDING PURPOSES ONLY, NOT FOR PRODUCTION USE

import type { Product } from "@/services/products.service";
import iphoneImg from "@/assets/sweetdeals-iphone-removebg-preview.png";
import laptopImg from "@/assets/sweetdeals-laptop-removebg-preview.png";
import samsungImg from "@/assets/sweetdeals-samsung-removebg-preview.png";
import iphone2Img from "@/assets/sweetdeals-iphone2-removebg-preview.png";

// Keep every price <= 2,000,000 so nothing is hidden by the Products page's default price filter.

interface Seed {
  id: string;
  name: string;
  brand: string;
  type: "smartphone" | "laptop";
  condition: "Brand New" | "UK Used" | "Open Box" | "Refurbished";
  section: "New Arrivals" | "Popular Products" | "Sweet Deals";
  price: number;
  image: string;
  rating: number;
  storage: string;
  color: string;
  screen: string;
  battery: string;
  feature: string;
  stock?: number;
}

const mk = (s: Seed): Product =>
  ({
    id: `dummy-${s.id}`,
    slug: `dummy-${s.id}`,
    name: s.name,
    brand: s.brand,
    type: s.type,
    category: s.type === "laptop" ? "Laptops" : "Smartphones",
    condition: s.condition,
    section: s.section,
    price: s.price,
    image: s.image,
    rating: s.rating,
    inStock: true,
    storage: s.storage,
    specs: { screenSize: s.screen, battery: s.battery },
    features: [s.feature],
    variants: [
      {
        id: `dummy-${s.id}-v1`,
        price: s.price,
        stock: s.stock ?? 5,
        is_active: true,
        storage: s.storage,
        color: s.color,
        sku: `DUMMY-${s.id.toUpperCase()}`,
      },
    ],
  }) as unknown as Product;

// ── New Arrivals ─────────────────────────────────────────────────────────────
export const newArrivals: Product[] = [
  mk({ id: "na-1", name: "iPhone 15 Pro Max 256GB", brand: "Apple", type: "smartphone", condition: "Brand New", section: "New Arrivals", price: 1450000, image: iphoneImg, rating: 4.9, storage: "256GB", color: "Natural Titanium", screen: '6.7" Super Retina XDR', battery: "4422mAh", feature: "A17 Pro chip" }),
  mk({ id: "na-2", name: "MacBook Pro 14-inch M3", brand: "Apple", type: "laptop", condition: "Brand New", section: "New Arrivals", price: 1950000, image: laptopImg, rating: 4.9, storage: "512GB", color: "Space Black", screen: '14.2" Liquid Retina XDR', battery: "Up to 22 hrs", feature: "Apple M3 chip", stock: 3 }),
  mk({ id: "na-3", name: "Samsung Galaxy S24 Ultra 256GB", brand: "Samsung", type: "smartphone", condition: "Brand New", section: "New Arrivals", price: 1650000, image: samsungImg, rating: 4.8, storage: "256GB", color: "Titanium Black", screen: '6.8" Dynamic AMOLED 2X', battery: "5000mAh", feature: "Galaxy AI" }),
  mk({ id: "na-4", name: "iPhone 14 Pro 128GB", brand: "Apple", type: "smartphone", condition: "Brand New", section: "New Arrivals", price: 980000, image: iphone2Img, rating: 4.7, storage: "128GB", color: "Deep Purple", screen: '6.1" Super Retina XDR', battery: "3200mAh", feature: "A16 Bionic chip", stock: 8 }),
  mk({ id: "na-5", name: "iPhone 15 128GB", brand: "Apple", type: "smartphone", condition: "Brand New", section: "New Arrivals", price: 920000, image: iphone2Img, rating: 4.7, storage: "128GB", color: "Pink", screen: '6.1" Super Retina XDR', battery: "3349mAh", feature: "A16 Bionic chip" }),
  mk({ id: "na-6", name: "MacBook Air 13-inch M3", brand: "Apple", type: "laptop", condition: "Brand New", section: "New Arrivals", price: 1650000, image: laptopImg, rating: 4.8, storage: "256GB", color: "Midnight", screen: '13.6" Liquid Retina', battery: "Up to 18 hrs", feature: "Apple M3 chip", stock: 4 }),
  mk({ id: "na-7", name: "Samsung Galaxy S24+ 256GB", brand: "Samsung", type: "smartphone", condition: "Brand New", section: "New Arrivals", price: 1250000, image: samsungImg, rating: 4.7, storage: "256GB", color: "Onyx Black", screen: '6.7" Dynamic AMOLED 2X', battery: "4900mAh", feature: "Galaxy AI" }),
  mk({ id: "na-8", name: "iPhone 15 Pro 256GB", brand: "Apple", type: "smartphone", condition: "Brand New", section: "New Arrivals", price: 1300000, image: iphoneImg, rating: 4.8, storage: "256GB", color: "Blue Titanium", screen: '6.1" Super Retina XDR', battery: "3274mAh", feature: "A17 Pro chip" }),
];

// ── Popular Products (Products page only) ────────────────────────────────────
export const popularProducts: Product[] = [
  mk({ id: "pp-1", name: "iPhone 13 128GB", brand: "Apple", type: "smartphone", condition: "UK Used", section: "Popular Products", price: 620000, image: iphone2Img, rating: 4.7, storage: "128GB", color: "Midnight", screen: '6.1" Super Retina XDR', battery: "3240mAh", feature: "A15 Bionic chip", stock: 8 }),
  mk({ id: "pp-2", name: "Samsung Galaxy S23 256GB", brand: "Samsung", type: "smartphone", condition: "UK Used", section: "Popular Products", price: 560000, image: samsungImg, rating: 4.6, storage: "256GB", color: "Phantom Black", screen: '6.1" Dynamic AMOLED', battery: "3900mAh", feature: "Snapdragon 8 Gen 2", stock: 7 }),
  mk({ id: "pp-3", name: "MacBook Air M1 13-inch", brand: "Apple", type: "laptop", condition: "Open Box", section: "Popular Products", price: 850000, image: laptopImg, rating: 4.8, storage: "256GB", color: "Space Grey", screen: '13.3" Retina', battery: "Up to 18 hrs", feature: "Apple M1 chip", stock: 3 }),
  mk({ id: "pp-4", name: "iPhone 14 128GB", brand: "Apple", type: "smartphone", condition: "Brand New", section: "Popular Products", price: 780000, image: iphoneImg, rating: 4.7, storage: "128GB", color: "Starlight", screen: '6.1" Super Retina XDR', battery: "3279mAh", feature: "A15 Bionic chip" }),
  mk({ id: "pp-5", name: "iPhone 12 64GB", brand: "Apple", type: "smartphone", condition: "UK Used", section: "Popular Products", price: 420000, image: iphone2Img, rating: 4.5, storage: "64GB", color: "Blue", screen: '6.1" Super Retina XDR', battery: "2815mAh", feature: "A14 Bionic chip", stock: 10 }),
  mk({ id: "pp-6", name: "Samsung Galaxy S22 128GB", brand: "Samsung", type: "smartphone", condition: "UK Used", section: "Popular Products", price: 380000, image: samsungImg, rating: 4.5, storage: "128GB", color: "Phantom White", screen: '6.1" Dynamic AMOLED 2X', battery: "3700mAh", feature: "Snapdragon 8 Gen 1", stock: 6 }),
  mk({ id: "pp-7", name: "MacBook Pro 13-inch M1", brand: "Apple", type: "laptop", condition: "Refurbished", section: "Popular Products", price: 1100000, image: laptopImg, rating: 4.7, storage: "256GB", color: "Silver", screen: '13.3" Retina', battery: "Up to 20 hrs", feature: "Apple M1 chip", stock: 2 }),
  mk({ id: "pp-8", name: "iPhone 13 Pro 256GB", brand: "Apple", type: "smartphone", condition: "UK Used", section: "Popular Products", price: 720000, image: iphoneImg, rating: 4.7, storage: "256GB", color: "Sierra Blue", screen: '6.1" Super Retina XDR', battery: "3095mAh", feature: "A15 Bionic chip", stock: 5 }),
];

// ── Sweet Deals ──────────────────────────────────────────────────────────────
export const sweetDeals: Product[] = [
  mk({ id: "sd-1", name: "iPhone 15 Pro 256GB", brand: "Apple", type: "smartphone", condition: "Brand New", section: "Sweet Deals", price: 1050000, image: iphoneImg, rating: 4.9, storage: "256GB", color: "Natural Titanium", screen: '6.1" Super Retina XDR', battery: "3274mAh", feature: "A17 Pro chip" }),
  mk({ id: "sd-2", name: "MacBook Air M1 13-inch", brand: "Apple", type: "laptop", condition: "Open Box", section: "Sweet Deals", price: 850000, image: laptopImg, rating: 4.8, storage: "256GB", color: "Space Grey", screen: '13.3" Retina', battery: "Up to 18 hrs", feature: "Apple M1 chip", stock: 3 }),
  mk({ id: "sd-3", name: "Samsung Galaxy S23 256GB", brand: "Samsung", type: "smartphone", condition: "UK Used", section: "Sweet Deals", price: 560000, image: samsungImg, rating: 4.6, storage: "256GB", color: "Phantom Black", screen: '6.1" Dynamic AMOLED', battery: "3900mAh", feature: "Snapdragon 8 Gen 2", stock: 7 }),
  mk({ id: "sd-4", name: "iPhone 13 128GB", brand: "Apple", type: "smartphone", condition: "UK Used", section: "Sweet Deals", price: 620000, image: iphone2Img, rating: 4.7, storage: "128GB", color: "Midnight", screen: '6.1" Super Retina XDR', battery: "3240mAh", feature: "A15 Bionic chip", stock: 8 }),
  mk({ id: "sd-5", name: "iPhone 12 Pro 128GB", brand: "Apple", type: "smartphone", condition: "UK Used", section: "Sweet Deals", price: 480000, image: iphoneImg, rating: 4.5, storage: "128GB", color: "Pacific Blue", screen: '6.1" Super Retina XDR', battery: "2815mAh", feature: "A14 Bionic chip", stock: 6 }),
  mk({ id: "sd-6", name: "MacBook Pro 13-inch M2", brand: "Apple", type: "laptop", condition: "Open Box", section: "Sweet Deals", price: 1350000, image: laptopImg, rating: 4.8, storage: "256GB", color: "Space Grey", screen: '13.3" Retina', battery: "Up to 20 hrs", feature: "Apple M2 chip", stock: 2 }),
  mk({ id: "sd-7", name: "Samsung Galaxy S22 Ultra 256GB", brand: "Samsung", type: "smartphone", condition: "Refurbished", section: "Sweet Deals", price: 520000, image: samsungImg, rating: 4.5, storage: "256GB", color: "Burgundy", screen: '6.8" Dynamic AMOLED 2X', battery: "5000mAh", feature: "S Pen included", stock: 4 }),
  mk({ id: "sd-8", name: "iPhone 11 64GB", brand: "Apple", type: "smartphone", condition: "Refurbished", section: "Sweet Deals", price: 320000, image: iphone2Img, rating: 4.4, storage: "64GB", color: "Purple", screen: '6.1" Liquid Retina', battery: "3110mAh", feature: "A13 Bionic chip", stock: 9 }),
];

// ── Homepage = the first 4 of each Products page section ─────────────────────
// Module-level constants so the references stay stable between renders.
export const homeNewArrivals: Product[] = newArrivals.slice(0, 4);
export const homeSweetDeals: Product[] = sweetDeals.slice(0, 4);