// src/pages/admin/data/mockData.ts

// ── Product type ──────────────────────────────────────────────────────────────
export interface AdminProduct {
  id: string;
  name: string;
  condition: string;
  price: number;
  stock: number;
  status: "In Stock" | "Out of Stock" | "Low Stock";
  category: string;
  brand: string;
  storage: string;
  batteryHealth: string;
  color: string;
  description: string;
  images: string[];
  image?: string;
  image2?: string;
  type?: string;
  section?: "New Arrivals" | "Popular Products" | "Sweet Deals";
  features?: string[];
  screenSize?: string;
  camera?: string;
  battery?: string;
  inStock?: boolean;
  rating?: number;
  reviews?: number;
  tags?: string[];
  categories?: string[];
}

// ── Seed data ─────────────────────────────────────────────────────────────────
export const productsData: AdminProduct[] = [
  {
    id: "1",
    name: "14 Pro Max",
    condition: "UK Used",
    price: 897000,
    stock: 5,
    status: "In Stock",
    category: "Phones",
    brand: "Apple",
    storage: "256GB",
    batteryHealth: "100%",
    color: "Gray",
    description:
      "iPhone 14 Pro Max (256GB) features a 6.7-inch Super Retina XDR display with ProMotion, powered by Apple's A16 Bionic chip. Equipped with a 48MP triple-camera system, premium stainless-steel build, and large storage capacity. Fully tested and verified.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    type: "smartphone",
    section: "New Arrivals",
    features: [
      "48MP triple-camera system with ProRAW and ProRes support",
      "A16 Bionic chip — industry-leading performance and efficiency",
      "6.7-inch always-on ProMotion XDR display up to 2000 nits",
      "Titanium-grade stainless steel frame with Ceramic Shield front",
      "UK used, fully tested, all original parts and battery verified",
    ],
    screenSize: '6.7"',
    camera: "48MP Triple Camera",
    battery: "Up to 29hrs video playback",
    inStock: true,
    rating: 4.7,
    reviews: 89,
    tags: ["Flagship", "UK Used"],
  },
  {
    id: "2",
    name: "14 Pro",
    condition: "Brand New",
    price: 964000,
    stock: 0,
    status: "Out of Stock",
    category: "Phones",
    brand: "Apple",
    storage: "256GB",
    batteryHealth: "100%",
    color: "Silver",
    description: "Brand new iPhone 14 Pro with all original accessories, sealed in box.",
    images: ["/placeholder.svg"],
    type: "smartphone",
    section: "Popular Products",
    features: [
      "Dynamic Island replaces the notch with a versatile interactive display area",
      "48MP main camera with four-lens optical zoom up to 3x telephoto",
      "Always-On display that shows time and notifications without tapping",
      "A16 Bionic chip, the world's fastest smartphone chip at launch",
      "Brand new — sealed in original Apple packaging with full warranty",
    ],
    screenSize: '6.1"',
    camera: "48MP Main Camera",
    battery: "Up to 23hrs video playback",
    inStock: false,
    rating: 4.8,
    reviews: 124,
    tags: ["Flagship", "New"],
  },
  {
    id: "3",
    name: "11 Pro Max",
    condition: "Fairly Used",
    price: 204000,
    stock: 2,
    status: "Low Stock",
    category: "Phones",
    brand: "Apple",
    storage: "128GB",
    batteryHealth: "85%",
    color: "Space Gray",
    description: "Good condition iPhone 11 Pro Max with minor wear. All functions fully operational.",
    images: ["/placeholder.svg"],
    type: "smartphone",
    features: [
      "A13 Bionic chip — still faster than most Android flagships today",
      "Triple 12MP camera system with Night mode on every lens",
      "Super Retina XDR OLED display with HDR10 and Dolby Vision",
      "IP68 water resistance rated to 4 metres depth",
      "Fairly used — thoroughly inspected, all core functions verified",
    ],
    screenSize: '6.5"',
    camera: "12MP Triple Camera",
    battery: "Up to 20hrs video playback",
    inStock: true,
    rating: 4.3,
    reviews: 56,
    tags: ["Value", "Fairly Used"],
  },
];

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersData = [
  {
    id: "Aby-2601-0009",
    name: "Jenny Wilson",
    phone: "(209) 555-0104",
    address: "Plot 412, Aguiyi Ironsi Street Maitama, Abuja, FCT.",
    email: "jennywilson@email.com",
    date: "12/10/13. 18:14",
    items: [
      {
        id: "item-1",
        name: "iPhone 11 pro",
        tag: "Uk Used.",
        description: "256GB•Battery 89%•UK Used•Fully tested.",
        price: 275000,
        quantity: 2,
        subtotal: 550000,
        emoji: "📱",
      },
    ],
    paymentMethod: "Bank Transfer",
    subtotal: 550000,
    delivery: "Free",
    total: 550000,
    orderStatus: "Processing",
    paymentStatus: "Awaiting Confirmation",
    internalNote: "Awaiting bank transfer confirmation.",
  },
  {
    id: "Aby-2601-0013",
    name: "Ralph Edwards",
    phone: "(629) 555-0129",
    address: "24B, Adeola Odeku Street Victoria Island, Lagos State.",
    email: "ralphed43@email.com",
    date: "12/10/13. 14:30",
    items: [
      {
        id: "item-1",
        name: "Samsung Galaxy S22",
        tag: "Brand New",
        description: "128GB•Snapdragon 8 Gen1•Brand New•Sealed.",
        price: 292000,
        quantity: 2,
        subtotal: 584000,
        emoji: "📱",
      },
    ],
    paymentMethod: "Cash",
    subtotal: 584000,
    delivery: "Free",
    total: 584000,
    orderStatus: "Confirmed",
    paymentStatus: "Confirmed",
    internalNote: "",
  },
  {
    id: "Aby-2606-0313",
    name: "Devon Lane",
    phone: "(217) 555-0113",
    address: "24B, Adeola Odeku Street Victoria Island, Lagos, Lag...",
    email: "devonlane@email.com",
    date: "12/10/13. 10:20",
    items: [
      {
        id: "item-1",
        name: "MacBook Air M2",
        tag: "Uk Used.",
        description: "8GB RAM•256GB SSD•UK Used•Excellent condition.",
        price: 320000,
        quantity: 1,
        subtotal: 320000,
        emoji: "💻",
      },
    ],
    paymentMethod: "Bank Transfer",
    subtotal: 320000,
    delivery: 5000,
    total: 325000,
    orderStatus: "Processing",
    paymentStatus: "Pending",
    internalNote: "",
  },
  {
    id: "Aby-2508-0233",
    name: "Bessie Cooper",
    phone: "(308) 555-0121",
    address: "58, Upper Siluko Road Ogida Quarters, Benin City, Edo State.",
    email: "bessiecoop@email.com",
    date: "12/09/13. 16:45",
    items: [
      {
        id: "item-1",
        name: "iPad Air 5th Gen",
        tag: "Brand New",
        description: "64GB•Wi-Fi•Brand New•Sealed.",
        price: 194000,
        quantity: 1,
        subtotal: 194000,
        emoji: "📱",
      },
    ],
    paymentMethod: "Pay On Delivery",
    subtotal: 194000,
    delivery: "Free",
    total: 194000,
    orderStatus: "Delivered",
    paymentStatus: "Confirmed",
    internalNote: "",
  },
  {
    id: "Aby-2510-0013",
    name: "Eleanor Pena",
    phone: "(239) 555-0108",
    address: "Suite 12, Trans-Amadi Industrial Layout Port Harcourt, Rivers st...",
    email: "penaelean@email.com",
    date: "12/08/13. 09:15",
    items: [
      {
        id: "item-1",
        name: "AirPods Pro 2nd Gen",
        tag: "Brand New",
        description: "Active Noise Cancellation•USB-C•Brand New•Sealed.",
        price: 95000,
        quantity: 1,
        subtotal: 95000,
        emoji: "🎧",
      },
      {
        id: "item-2",
        name: "iPhone 14 Pro",
        tag: "Uk Used.",
        description: "256GB•Battery 92%•UK Used•Fully tested.",
        price: 355000,
        quantity: 1,
        subtotal: 355000,
        emoji: "📱",
      },
    ],
    paymentMethod: "Bank Transfer",
    subtotal: 450000,
    delivery: 3000,
    total: 453000,
    orderStatus: "Processing",
    paymentStatus: "Awaiting Confirmation",
    internalNote: "",
  },
  {
    id: "Aby-2512-0213",
    name: "Darlene Robertson",
    phone: "(808) 555-0111",
    address: "Block G, Housing Estate Ondo Road, Akure, Ondo State.",
    email: "robertson7@email.com",
    date: "12/07/13. 11:30",
    items: [
      {
        id: "item-1",
        name: "iPhone 11 Pro",
        tag: "Uk Used.",
        description: "256GB•Battery 87%•UK Used•Fully tested.",
        price: 275000,
        quantity: 1,
        subtotal: 275000,
        emoji: "📱",
      },
    ],
    paymentMethod: "Cash",
    subtotal: 275000,
    delivery: "Free",
    total: 275000,
    orderStatus: "Confirmed",
    paymentStatus: "Confirmed",
    internalNote: "",
  },
];

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentsData = [
  {
    paymentId: "Pay-0126-0012",
    orderId: "Aby-0126-0012",
    customerName: "Jenny Wilson",
    amount: 234000,
    paymentMethod: "Bank Transfer",
    status: "Confirmed",
  },
  {
    paymentId: "Pay-0126-0011",
    orderId: "Aby-0126-0011",
    customerName: "Ralph Edwards",
    amount: 584000,
    paymentMethod: "Cash",
    status: "Confirmed",
  },
  {
    paymentId: "Pay-0126-0010",
    orderId: "Aby-0126-0010",
    customerName: "Bessie Cooper",
    amount: 194000,
    paymentMethod: "Pay On Delivery",
    status: "Pending",
  },
];

// ── Customers ─────────────────────────────────────────────────────────────────
export const customersData = [
  {
    id: "1",
    name: "Jenny Wilson",
    lastVisit: "17-01-26. 18:23.pm",
    phone: "(209) 555-0104",
    age: 21,
    email: "jennywilson@email.com",
  },
  {
    id: "2",
    name: "Ralph Edwards",
    lastVisit: "12-01-26. 18:01.pm",
    phone: "(629) 555-0129",
    age: 28,
    email: "ralphed43@email.com",
  },
];

// ── Staff ─────────────────────────────────────────────────────────────────────

export interface StaffPermissions {
  order: {
    viewOrder: boolean;
    updateOrderStatus: boolean;
    addInternalNotes: boolean;
  };
  payments: {
    contactCustomers: boolean;
  };
  delivery: {
    confirmDelivery: boolean;
  };
  products: {
    confirmPaymentStatus: boolean;
  };
}

export interface Staff {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "Inactive";
  homeAddress: string;
  permissions: StaffPermissions;
}

export const staffList: Staff[] = [
  {
    id: "1",
    fullName: "Egoh .J.",
    email: "egohjimmy422@gmail.com",
    phone: "09030834028",
    role: "Staff",
    status: "Active",
    homeAddress: "8, Oni-Oladipupo Street Mowe Ogun State, Nigeria",
    permissions: {
      order: { viewOrder: true, updateOrderStatus: true, addInternalNotes: true },
      payments: { contactCustomers: true },
      delivery: { confirmDelivery: false },
      products: { confirmPaymentStatus: false },
    },
  },
  {
    id: "2",
    fullName: "Amara Okafor",
    email: "amara@abygadgets.com",
    phone: "+234 801 234 5678",
    role: "Order Manager",
    status: "Active",
    homeAddress: "14 Broad Street, Lagos Island, Lagos",
    permissions: {
      order: { viewOrder: true, updateOrderStatus: true, addInternalNotes: false },
      payments: { contactCustomers: false },
      delivery: { confirmDelivery: true },
      products: { confirmPaymentStatus: false },
    },
  },
  {
    id: "3",
    fullName: "Emeka Nwosu",
    email: "emeka@abygadgets.com",
    phone: "+234 802 987 6543",
    role: "Delivery Staff",
    status: "Active",
    homeAddress: "7 Allen Avenue, Ikeja, Lagos",
    permissions: {
      order: { viewOrder: true, updateOrderStatus: false, addInternalNotes: false },
      payments: { contactCustomers: false },
      delivery: { confirmDelivery: true },
      products: { confirmPaymentStatus: false },
    },
  },
  {
    id: "4",
    fullName: "Fatima Abdullahi",
    email: "fatima@abygadgets.com",
    phone: "+234 803 456 7890",
    role: "Customer Support",
    status: "Inactive",
    homeAddress: "22 Adeola Odeku, Victoria Island, Lagos",
    permissions: {
      order: { viewOrder: true, updateOrderStatus: false, addInternalNotes: true },
      payments: { contactCustomers: true },
      delivery: { confirmDelivery: false },
      products: { confirmPaymentStatus: false },
    },
  },
];

// Keep staffData pointing at the first entry for any legacy imports
export const staffData = staffList[0];

// ── Lookup lists ──────────────────────────────────────────────────────────────
export const categories = ["phones", "laptops", "tablets", "accessories", "gadget", "wearable", "Others"];
export const brands     = ["Apple", "Samsung", "Dell", "HP", "Lenovo", "Microsoft", "Others"];
export const conditions = ["Brand New", "UK Used", "Fairly Used", "Open Box", "Refurbished"];

export const orderStatuses   = ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"];
export const paymentStatuses = ["Awaiting Confirmation", "Confirmed", "Failed", "Refunded"];