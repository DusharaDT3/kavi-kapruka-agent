import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | null | undefined, currency = "LKR"): string {
  if (amount == null) return "Price unavailable";
  if (currency === "LKR") return `LKR ${amount.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
  return `${currency} ${amount.toFixed(2)}`;
}

export function toolDisplayName(toolName: string): string {
  const names: Record<string, string> = {
    kapruka_search_products: "Searching Kapruka catalog",
    kapruka_get_product: "Getting product details",
    kapruka_list_categories: "Browsing categories",
    kapruka_list_delivery_cities: "Checking delivery cities",
    kapruka_check_delivery: "Checking delivery availability",
    kapruka_create_order: "Creating your order",
    kapruka_track_order: "Tracking your order",
  };
  return names[toolName] || toolName;
}

export function stockLabel(level?: string | null, inStock?: boolean): string {
  if (!inStock) return "Out of stock";
  if (level === "low") return "Low stock";
  if (level === "high") return "In stock";
  return "In stock";
}

export function stockColor(level?: string | null, inStock?: boolean): string {
  if (!inStock) return "text-error";
  if (level === "low") return "text-accent";
  return "text-success";
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
