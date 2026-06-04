"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { KaprukaProduct, CartItem } from "@/types";

interface ProductCarouselProps {
  products: KaprukaProduct[];
  onAddToCart: (item: CartItem) => void;
  cartProductIds: Set<string>;
  title?: string;
}

export function ProductCarousel({
  products,
  onAddToCart,
  cartProductIds,
  title,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  if (!products.length) return null;

  return (
    <div className="mt-3 mb-1">
      {title && (
        <p className="text-xs text-text-muted font-medium mb-2 px-1">{title}</p>
      )}

      <div className="relative group">
        {/* Left scroll button */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10
            w-7 h-7 rounded-full bg-surface-3 border border-border text-text-muted
            hover:bg-border hover:text-text-primary transition-all
            opacity-0 group-hover:opacity-100 shadow-lg"
        >
          <ChevronLeft size={14} className="mx-auto" />
        </button>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto hide-scrollbar pb-1"
        >
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              inCart={cartProductIds.has(product.id)}
              index={i}
            />
          ))}
        </div>

        {/* Right scroll button */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10
            w-7 h-7 rounded-full bg-surface-3 border border-border text-text-muted
            hover:bg-border hover:text-text-primary transition-all
            opacity-0 group-hover:opacity-100 shadow-lg"
        >
          <ChevronRight size={14} className="mx-auto" />
        </button>
      </div>
    </div>
  );
}
