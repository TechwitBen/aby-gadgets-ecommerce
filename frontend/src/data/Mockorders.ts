export interface Order {
  id: string;
  name: string;
  price: number;
  quantity: number;
  date: string;
  paymentStatus: "Paid" | "Pending";
  deliveryStatus: "Processing" | "Shipped" | "Out for Delivery" | "Delivered";
  image: string;
  deliveryAddress: string;
  estimatedDelivery: string;
  category: string;
}

export const mockOrders: Order[] = [
  {
    id: "ABY-1023",
    name: "iPhone 14 Pro",
    price: 850000,
    quantity: 1,
    date: "Mar 20, 2026",
    paymentStatus: "Paid",
    deliveryStatus: "Shipped",
    image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=200&h=200&fit=crop",
    deliveryAddress: "14 Admiralty Way, Lekki Phase 1, Lagos",
    estimatedDelivery: "Apr 10, 2026",
    category: "Electronics",
  },
  {
    id: "ABY-1019",
    name: "Samsung Galaxy Watch 6",
    price: 280000,
    quantity: 2,
    date: "Mar 15, 2026",
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop",
    deliveryAddress: "22 Bode Thomas Street, Surulere, Lagos",
    estimatedDelivery: "Mar 28, 2026",
    category: "Wearables",
  },
  {
    id: "ABY-1031",
    name: "Sony WH-1000XM5 Headphones",
    price: 195000,
    quantity: 1,
    date: "Mar 25, 2026",
    paymentStatus: "Pending",
    deliveryStatus: "Processing",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
    deliveryAddress: "5 Aminu Kano Crescent, Wuse 2, Abuja",
    estimatedDelivery: "Apr 15, 2026",
    category: "Audio",
  },
  {
    id: "ABY-1027",
    name: "MacBook Air M3",
    price: 1450000,
    quantity: 1,
    date: "Mar 18, 2026",
    paymentStatus: "Paid",
    deliveryStatus: "Out for Delivery",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&h=200&fit=crop",
    deliveryAddress: "Plot 1234 Herbert Macaulay Way, Yaba, Lagos",
    estimatedDelivery: "Apr 6, 2026",
    category: "Computers",
  },
  {
    id: "ABY-1015",
    name: "Logitech MX Master 3S",
    price: 65000,
    quantity: 1,
    date: "Mar 10, 2026",
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop",
    deliveryAddress: "3 Opebi Road, Ikeja, Lagos",
    estimatedDelivery: "Mar 20, 2026",
    category: "Accessories",
  },
];