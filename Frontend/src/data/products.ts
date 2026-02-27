import productPhone from "@/assets/product-phone.png";
import productLaptop from "@/assets/product-laptop.png";
import productTablet from "@/assets/product-tablet.png";
import productAccessories from "@/assets/product-accessories.png";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand?: string;
  condition?: string;
  description?: string;
  features?: string[];
  colors?: string[];
  storage?: string[];
  rating?: number;
  reviews?: number;
}

export const products: Product[] = [
  // New Arrivals
  {
    id: "1",
    name: "iPhone 15pro",
    price: 890000,
    originalPrice: 950000,
    image: productPhone,
    category: "Phones",
    brand: "Apple",
    condition: "UK Used",
    description: "UK Used, 256GB, Battery health 96%, mint condition, all parts original and fully functional.",
    features: [
      "Pro-level camera performance with triple 12MP lenses that captures sharp photos, videos night shots, and more",
      "Large, fluid display experience on a 6.7-inch Super Retina XDR screen with ProMotion for bright display",
      "Powerful iOS chip with 6-core CPU that delivers ultra-fast performance",
      "UK used. Fully tested and verified, carefully inspected to ensure full functionality, original components, and authenticity"
    ],
    colors: ["Space Black", "Silver", "Gold", "Deep Purple"],
    storage: ["128GB", "256GB", "512GB", "1TB"],
    rating: 4.8,
    reviews: 124
  },
  {
    id: "2",
    name: "iPhone 14 pro max",
    price: 780000,
    originalPrice: 850000,
    image: productPhone,
    category: "Phones",
    brand: "Apple",
    condition: "UK Used",
    description: "Excellent condition with all original parts.",
    features: [
      "Dynamic Island feature",
      "48MP main camera",
      "A16 Bionic chip",
      "ProMotion display"
    ],
    colors: ["Space Black", "Silver", "Gold", "Deep Purple"],
    storage: ["128GB", "256GB", "512GB", "1TB"],
    rating: 4.7,
    reviews: 89
  },
  {
    id: "3",
    name: "iPhone 17",
    price: 1200000,
    originalPrice: 1350000,
    image: productPhone,
    category: "Phones",
    brand: "Apple",
    condition: "Brand New",
    description: "Latest iPhone with cutting edge features.",
    features: [
      "A18 Pro chip",
      "Advanced camera system",
      "Titanium design",
      "All-day battery life"
    ],
    colors: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"],
    storage: ["256GB", "512GB", "1TB"],
    rating: 4.9,
    reviews: 45
  },
  {
    id: "4",
    name: "iPhone 17 Air",
    price: 980000,
    originalPrice: 1100000,
    image: productPhone,
    category: "Phones",
    brand: "Apple",
    condition: "Brand New",
    description: "Ultra-thin design with powerful performance.",
    features: [
      "Thinnest iPhone ever",
      "A18 chip",
      "48MP camera",
      "USB-C charging"
    ],
    colors: ["Midnight", "Starlight", "Blue", "Purple", "Yellow"],
    storage: ["128GB", "256GB", "512GB"],
    rating: 4.6,
    reviews: 32
  },
  // Popular Products
  {
    id: "5",
    name: "iPhone 16 pro max",
    price: 1050000,
    originalPrice: 1150000,
    image: productPhone,
    category: "Phones",
    brand: "Apple",
    condition: "Brand New",
    description: "The ultimate iPhone experience.",
    features: [
      "A18 Pro chip",
      "5x optical zoom",
      "Action button",
      "Titanium frame"
    ],
    colors: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"],
    storage: ["256GB", "512GB", "1TB"],
    rating: 4.9,
    reviews: 156
  },
  {
    id: "6",
    name: "iMobile 14 pro",
    price: 720000,
    image: productPhone,
    category: "Phones",
    brand: "Apple",
    condition: "UK Used",
    description: "(UK Used), 256GB, 89% battery health, very neat condition, all parts original and fully functional.",
    features: [
      "ProMotion display",
      "48MP main camera",
      "A16 Bionic",
      "Ceramic Shield"
    ],
    colors: ["Space Black", "Silver", "Gold"],
    storage: ["128GB", "256GB", "512GB"],
    rating: 4.5,
    reviews: 78
  },
  {
    id: "7",
    name: "iPhone 12 mini",
    price: 380000,
    originalPrice: 420000,
    image: productPhone,
    category: "Phones",
    brand: "Apple",
    condition: "UK Used",
    description: "Compact powerhouse.",
    features: [
      "A14 Bionic chip",
      "Dual camera system",
      "5G capable",
      "Ceramic Shield"
    ],
    colors: ["Black", "White", "Blue", "Green", "Red"],
    storage: ["64GB", "128GB", "256GB"],
    rating: 4.4,
    reviews: 234
  },
  {
    id: "8",
    name: "iPhone 13 pro",
    price: 580000,
    originalPrice: 650000,
    image: productPhone,
    category: "Phones",
    brand: "Apple",
    condition: "UK Used",
    description: "Professional camera system in a compact form.",
    features: [
      "A15 Bionic chip",
      "ProMotion display",
      "Macro photography",
      "Cinematic mode"
    ],
    colors: ["Graphite", "Gold", "Silver", "Sierra Blue"],
    storage: ["128GB", "256GB", "512GB", "1TB"],
    rating: 4.6,
    reviews: 189
  },
  // Laptops
  {
    id: "9",
    name: "MacBook Pro 14",
    price: 1850000,
    originalPrice: 2100000,
    image: productLaptop,
    category: "Laptops",
    brand: "Apple",
    condition: "Brand New",
    description: "Professional laptop for power users.",
    features: [
      "M3 Pro chip",
      "Liquid Retina XDR display",
      "18-hour battery life",
      "MagSafe charging"
    ],
    colors: ["Space Black", "Silver"],
    storage: ["512GB", "1TB", "2TB"],
    rating: 4.9,
    reviews: 67
  },
  {
    id: "10",
    name: "Dell Inspiron 15 5000",
    price: 425000,
    originalPrice: 480000,
    image: productLaptop,
    category: "Laptops",
    brand: "Dell",
    condition: "Brand New",
    description: "Versatile everyday laptop.",
    features: [
      "Intel Core i7",
      "8GB RAM, 512GB SSD",
      "15.6\" FHD display",
      "Windows 11"
    ],
    colors: ["Silver", "Black"],
    storage: ["256GB", "512GB", "1TB"],
    rating: 4.3,
    reviews: 145
  },
  // Tablets
  {
    id: "11",
    name: "iPad Pro 12.9",
    price: 980000,
    originalPrice: 1100000,
    image: productTablet,
    category: "Tablets",
    brand: "Apple",
    condition: "Brand New",
    description: "The ultimate iPad experience.",
    features: [
      "M2 chip",
      "Liquid Retina XDR display",
      "Face ID",
      "Apple Pencil support"
    ],
    colors: ["Space Gray", "Silver"],
    storage: ["128GB", "256GB", "512GB", "1TB", "2TB"],
    rating: 4.8,
    reviews: 89
  },
  // Accessories
  {
    id: "12",
    name: "Apple AirPods Pro",
    price: 125000,
    originalPrice: 145000,
    image: productAccessories,
    category: "Accessories",
    brand: "Apple",
    condition: "Brand New",
    description: "Active Noise Cancellation, Wireless Charging Case, white.",
    features: [
      "Active Noise Cancellation",
      "Transparency mode",
      "Personalized Spatial Audio",
      "MagSafe Charging Case"
    ],
    colors: ["White"],
    rating: 4.7,
    reviews: 312
  },
  {
    id: "13",
    name: "iPhone 13 Pro Max",
    price: 650000,
    originalPrice: 720000,
    image: productPhone,
    category: "Phones",
    brand: "Apple",
    condition: "UK Used",
    description: "Excellent condition, battery health 92%.",
    features: [
      "A15 Bionic chip",
      "ProMotion display",
      "Cinematic mode",
      "All-day battery"
    ],
    colors: ["Graphite", "Gold", "Silver", "Sierra Blue", "Alpine Green"],
    storage: ["128GB", "256GB", "512GB", "1TB"],
    rating: 4.7,
    reviews: 267
  },
  {
    id: "14",
    name: "Open Box iPhone 11",
    price: 295000,
    originalPrice: 340000,
    image: productPhone,
    category: "Phones",
    brand: "Apple",
    condition: "Open Box",
    description: "Like new condition with warranty.",
    features: [
      "A13 Bionic chip",
      "Dual camera system",
      "Night mode",
      "Water resistant"
    ],
    colors: ["Black", "White", "Green", "Yellow", "Purple", "Red"],
    storage: ["64GB", "128GB", "256GB"],
    rating: 4.4,
    reviews: 178
  },
  {
    id: "15",
    name: "iPhone 8",
    price: 145000,
    originalPrice: 175000,
    image: productPhone,
    category: "Phones",
    brand: "Apple",
    condition: "UK Used",
    description: "Good condition, fully functional.",
    features: [
      "A11 Bionic chip",
      "Touch ID",
      "Wireless charging",
      "Retina HD display"
    ],
    colors: ["Space Gray", "Silver", "Gold"],
    storage: ["64GB", "128GB", "256GB"],
    rating: 4.2,
    reviews: 456
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter((p) => p.category === category);
};

export const formatPrice = (price: number): string => {
  return `₦${price.toLocaleString()}`;
};
