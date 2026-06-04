import type Anthropic from "@anthropic-ai/sdk";

export const KAPRUKA_TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: "kapruka_search_products",
    description:
      'Search Kapruka.com products by keyword with optional category, price, stock, and sort filters. ALWAYS use response_format="json" to enable rich product card rendering in the UI.',
    input_schema: {
      type: "object" as const,
      properties: {
        q: {
          type: "string",
          description:
            "Search query (min 3 chars, specific terms — e.g. 'birthday cake chocolate', 'red roses bouquet')",
        },
        category: {
          type: "string",
          description:
            "Category filter — e.g. 'Birthday', 'Cakes', 'Flowers', 'Chocolates', 'Electronics'",
        },
        limit: {
          type: "number",
          description: "Results to return (1–50, default 10)",
        },
        cursor: {
          type: "string",
          description: "Pagination cursor from previous response next_cursor",
        },
        currency: {
          type: "string",
          description: "LKR (default), USD, GBP, AUD, CAD, EUR",
        },
        min_price: { type: "number", description: "Min price (inclusive)" },
        max_price: { type: "number", description: "Max price (inclusive)" },
        in_stock_only: {
          type: "boolean",
          description: "Only return in-stock items",
        },
        sort: {
          type: "string",
          description:
            "relevance (default) | price_asc | price_desc | newest | bestseller",
        },
        response_format: {
          type: "string",
          description: "Always pass 'json' for structured data",
        },
      },
      required: ["q", "response_format"],
    },
  },
  {
    name: "kapruka_get_product",
    description:
      "Get full details for a single Kapruka product by ID — name, description, price, stock, images, variants, and URL. Use response_format='json'.",
    input_schema: {
      type: "object" as const,
      properties: {
        product_id: {
          type: "string",
          description: "Kapruka product ID (e.g. 'cake00ka002034')",
        },
        currency: {
          type: "string",
          description: "LKR (default), USD, GBP, AUD, CAD, EUR",
        },
        response_format: {
          type: "string",
          description: "Always pass 'json'",
        },
      },
      required: ["product_id", "response_format"],
    },
  },
  {
    name: "kapruka_list_categories",
    description:
      "List top-level Kapruka categories. Use to discover what's available or to find the right category name for search filtering.",
    input_schema: {
      type: "object" as const,
      properties: {
        depth: {
          type: "number",
          description: "Category depth (default 1)",
        },
      },
      required: [],
    },
  },
  {
    name: "kapruka_list_delivery_cities",
    description:
      "Search Kapruka's Sri Lanka delivery network by city name or vernacular alias. Use to verify a city is deliverable before checkout.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description:
            "City name or partial name (e.g. 'Colombo', 'Kandy', 'Galle')",
        },
        limit: {
          type: "number",
          description: "Max results (default 10, max 50)",
        },
      },
      required: [],
    },
  },
  {
    name: "kapruka_check_delivery",
    description:
      "Check if Kapruka can deliver to a specific city on a given date, and get the delivery fee. Also validates perishable product warnings (cakes, flowers).",
    input_schema: {
      type: "object" as const,
      properties: {
        city: {
          type: "string",
          description:
            "Delivery city (must be a valid Kapruka delivery city name)",
        },
        delivery_date: {
          type: "string",
          description: "Date in YYYY-MM-DD format (must be today or future)",
        },
        product_id: {
          type: "string",
          description: "Optional — product ID to check perishable warnings",
        },
      },
      required: ["city", "delivery_date"],
    },
  },
  {
    name: "kapruka_create_order",
    description:
      "Create a guest-checkout order on Kapruka. Returns a pay link valid for 60 minutes. No Kapruka account needed. Supports multi-item carts, gift messages, and icing text for cakes.",
    input_schema: {
      type: "object" as const,
      properties: {
        cart: {
          type: "array",
          description: "1–30 items",
          items: {
            type: "object",
            properties: {
              product_id: { type: "string" },
              quantity: { type: "number", description: "Default 1" },
              icing_text: {
                type: "string",
                description: "Cake icing message (cakes only)",
              },
            },
            required: ["product_id"],
          },
        },
        recipient: {
          type: "object",
          properties: {
            name: { type: "string" },
            phone: {
              type: "string",
              description: "077XXXXXXX or +9477XXXXXXX",
            },
          },
          required: ["name", "phone"],
        },
        delivery: {
          type: "object",
          properties: {
            address: { type: "string" },
            city: {
              type: "string",
              description: "Must be a valid Kapruka delivery city",
            },
            location_type: {
              type: "string",
              description: "house | apartment | office | other",
            },
            date: { type: "string", description: "YYYY-MM-DD" },
            instructions: { type: "string" },
          },
          required: ["address", "city", "date"],
        },
        sender: {
          type: "object",
          properties: {
            name: { type: "string" },
            anonymous: { type: "boolean" },
          },
          required: ["name"],
        },
        gift_message: {
          type: "string",
          description: "Optional gift card message (max 300 chars)",
        },
        currency: { type: "string", description: "LKR (default)" },
        response_format: {
          type: "string",
          description: "Always pass 'json'",
        },
      },
      required: ["cart", "recipient", "delivery", "sender", "response_format"],
    },
  },
  {
    name: "kapruka_track_order",
    description:
      "Track a Kapruka order by order number. The order number comes from the customer's confirmation email after payment — it is NOT the order_ref from kapruka_create_order.",
    input_schema: {
      type: "object" as const,
      properties: {
        order_number: {
          type: "string",
          description: "Order number from confirmation email (e.g. 'VIMP34456CB2')",
        },
        response_format: {
          type: "string",
          description: "Always pass 'json'",
        },
      },
      required: ["order_number", "response_format"],
    },
  },
];
