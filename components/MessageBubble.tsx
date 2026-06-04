"use client";

import { motion } from "framer-motion";
import { ProductCarousel } from "./ProductCarousel";
import { OrderConfirmation } from "./OrderConfirmation";
import { cn } from "@/lib/utils";
import type { ChatMessage, CartItem, KaprukaProduct, SearchResult, OrderCreated } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
  onAddToCart: (item: CartItem) => void;
  cartProductIds: Set<string>;
  isStreaming?: boolean;
}

function KaviAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-kavi-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md shadow-primary/30">
      K
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-text-muted animate-pulse-dot"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </div>
  );
}

function renderContent(text: string) {
  // Simple markdown-like rendering
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="text-base font-semibold text-text-primary mt-2 mb-1">
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="text-sm font-semibold text-text-primary mt-1.5 mb-0.5">
          {line.slice(4)}
        </h4>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc pl-4 space-y-0.5 my-1">
          {items.map((item, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: inlineMarkdown(item) }} />
          ))}
        </ul>
      );
      continue;
    } else if (line.trim() === "") {
      if (elements.length > 0) {
        elements.push(<div key={i} className="h-1" />);
      }
    } else {
      elements.push(
        <p key={i} dangerouslySetInnerHTML={{ __html: inlineMarkdown(line) }} />
      );
    }

    i++;
  }

  return elements;
}

function inlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-text-primary">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-primary/15 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-light underline">$1</a>');
}

export function MessageBubble({
  message,
  onAddToCart,
  cartProductIds,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  // Extract product search results from tool results
  const searchResults = message.toolResults
    ?.filter((tr) => tr.toolName === "kapruka_search_products")
    .map((tr) => tr.result as SearchResult)
    .filter(Boolean);

  const orderResult = message.toolResults?.find(
    (tr) => tr.toolName === "kapruka_create_order"
  )?.result as OrderCreated | undefined;

  const allProducts: KaprukaProduct[] = searchResults?.flatMap(
    (sr) => sr?.results || []
  ) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex gap-3 px-4 py-2",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isUser && <KaviAvatar />}

      <div
        className={cn(
          "flex flex-col max-w-[80%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-user-gradient text-white rounded-tr-sm"
              : "bg-surface border border-border text-text-primary rounded-tl-sm"
          )}
        >
          {isStreaming && !message.content ? (
            <TypingDots />
          ) : (
            <div className="prose-kavi space-y-0.5">
              {renderContent(message.content)}
            </div>
          )}

          {isStreaming && message.content && (
            <span className="inline-block w-0.5 h-4 bg-primary-light ml-0.5 animate-pulse align-middle" />
          )}
        </div>

        {/* Product Carousel */}
        {allProducts.length > 0 && (
          <div className="mt-2 w-full max-w-[500px]">
            <ProductCarousel
              products={allProducts}
              onAddToCart={onAddToCart}
              cartProductIds={cartProductIds}
            />
          </div>
        )}

        {/* Order Confirmation */}
        {orderResult && <OrderConfirmation order={orderResult} />}

        {/* Timestamp */}
        <span className="text-[10px] text-text-faint mt-1 px-1">
          {message.timestamp.toLocaleTimeString("en-LK", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Colombo",
          })}
        </span>
      </div>
    </motion.div>
  );
}
