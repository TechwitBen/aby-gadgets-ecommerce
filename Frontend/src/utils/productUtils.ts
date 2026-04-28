// src/utils/productUtils.ts
// Shared helpers used across Products, FeaturedProducts, ProductCard, etc.
// Import from here instead of duplicating in each component.

import {
  Smartphone,
  Monitor,
  Tablet,
  Headphones,
  Watch,
  Gamepad,
  Speaker,
  Camera,
  HardDrive,
  BatteryCharging,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Product } from "@/services/products.service";

// ─── Type icon ────────────────────────────────────────────────────────────────
export const getTypeIcon = (type: string = "smartphone"): LucideIcon => {
  switch (type) {
    case "smartphone":
      return Smartphone;
    case "laptop":
      return Monitor;
    case "tablet":
      return Tablet;
    case "earbuds":
    case "headphones":
      return Headphones;
    case "smartwatch":
      return Watch;
    case "gaming":
      return Gamepad;
    case "camera":
    case "drone":
      return Camera;
    case "e-reader":
      return Tablet;
    case "speaker":
      return Speaker;
    default:
      return Smartphone;
  }
};

// ─── Type colour classes ──────────────────────────────────────────────────────
export const getTypeColor = (type: string = "smartphone"): string => {
  switch (type) {
    case "smartphone":
      return "bg-blue-100 text-blue-600";
    case "laptop":
      return "bg-purple-100 text-purple-600";
    case "tablet":
      return "bg-green-100 text-green-600";
    case "earbuds":
      return "bg-amber-100 text-amber-600";
    case "headphones":
      return "bg-orange-100 text-orange-600";
    case "smartwatch":
      return "bg-pink-100 text-pink-600";
    case "gaming":
      return "bg-red-100 text-red-600";
    case "camera":
      return "bg-indigo-100 text-indigo-600";
    case "drone":
      return "bg-cyan-100 text-cyan-600";
    case "e-reader":
      return "bg-gray-100 text-gray-600";
    case "speaker":
      return "bg-violet-100 text-violet-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

// ─── Two representative specs ─────────────────────────────────────────────────
export interface Spec {
  label: string;
  value: string;
  icon: LucideIcon;
}

export const getTwoSpecs = (product: Product): Spec[] => {
  const specs: Spec[] = [];

  if (product.storage) {
    specs.push({ label: "Storage", value: product.storage, icon: HardDrive });
  }

  if (product.specs?.camera) {
    specs.push({ label: "Camera", value: product.specs.camera, icon: Camera });
  } else if (product.specs?.screenSize) {
    specs.push({
      label: "Display",
      value: product.specs.screenSize,
      icon: Monitor,
    });
  } else if (product.specs?.battery) {
    specs.push({
      label: "Battery",
      value: product.specs.battery,
      icon: BatteryCharging,
    });
  } else if (product.features && product.features.length > 0) {
    specs.push({ label: "Feature", value: product.features[0], icon: Zap });
  }

  return specs.slice(0, 2);
};
