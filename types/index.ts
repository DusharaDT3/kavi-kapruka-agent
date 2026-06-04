export type Role = "user" | "assistant";

export interface KaprukaProduct {
  id: string;
  name: string;
  summary?: string;
  price: { amount: number | null; currency: string };
  compare_at_price?: { amount: number; currency: string } | null;
  in_stock: boolean;
  stock_level?: "low" | "medium" | "high";
  image_url?: string | null;
  images?: string[];
  category?: { id: string; name: string; slug: string };
  url: string;
  ships_internationally?: boolean;
}

export interface SearchResult {
  results: KaprukaProduct[];
  next_cursor: string | null;
  applied_filters?: { q: string; limit: number; in_stock_only: boolean };
}

export interface CartItem {
  product: KaprukaProduct;
  quantity: number;
  icing_text?: string;
}

export interface DeliveryDetails {
  address: string;
  city: string;
  location_type: "house" | "apartment" | "office" | "other";
  date: string;
  instructions?: string;
}

export interface RecipientDetails {
  name: string;
  phone: string;
}

export interface SenderDetails {
  name: string;
  anonymous: boolean;
}

export interface OrderCreated {
  checkout_url: string;
  order_ref: string;
  summary: {
    items_total: number;
    delivery_fee: number;
    addons_total?: number;
    grand_total: number;
    currency: string;
  };
  expires_at: string;
}

export interface ToolResult {
  toolName: string;
  toolUseId: string;
  result: unknown;
}

export interface ToolCallState {
  toolUseId: string;
  toolName: string;
  status: "calling" | "done" | "error";
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  toolResults?: ToolResult[];
  timestamp: Date;
}

// Anthropic API message shapes (simplified for our use)
export interface ApiMessage {
  role: "user" | "assistant";
  content: string | ApiContentBlock[];
}

export interface ApiContentBlock {
  type: "text" | "tool_use" | "tool_result";
  [key: string]: unknown;
}

export type StreamEvent =
  | { type: "tool_call"; toolName: string; toolUseId: string }
  | { type: "tool_result"; toolName: string; toolUseId: string; result: unknown }
  | { type: "text"; content: string }
  | { type: "done" }
  | { type: "error"; message: string };
