"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ShoppingCart, ExternalLink, Package } from "lucide-react";
import { cn, formatPrice, stockLabel, stockColor } from "@/lib/utils";
import type { KaprukaProduct, CartItem } from "@/types";

interface ProductCardProps {
  product: KaprukaProduct;
  onAddToCart: (item: CartItem) => void;
  inCart?: boolean;
  index?: number;
}

export function ProductCard({ product, onAddToCart, inCart = false, index = 0 }: ProductCardProps) {
  const imageUrl = product.image_url || product.images?.[0];
  const price = product.price?.amount;
  const comparePrice = product.compare_at_price?.amount;
  const hasDiscount = comparePrice && comparePrice > (price ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative flex-shrink-0 w-44 rounded-2xl overflow-hidden border transition-all duration-200 group",
        "bg-surface-2 border-border",
        "hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
      )}
    >
      {/* Image */}
      <div className="relative w-full h-40 bg-surface overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="176px"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} className="text-text-faint" />
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-error text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            SALE
          </div>
        )}

        {/* Out of stock overlay */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-bg/70 flex items-center justify-center">
            <span className="text-xs text-text-muted font-medium">Out of stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-xs text-text-primary font-medium line-clamp-2 leading-tight mb-2 min-h-[2.5rem]">
          {product.name}
        </p>

        {/* Price */}
        <div className="mb-2">
          <span className="text-accent font-bold text-sm">
            {formatPrice(price, product.price?.currency)}
          </span>
          {hasDiscount && (
            <span className="ml-1.5 text-text-faint text-xs line-through">
              {formatPrice(comparePrice, product.compare_at_price?.currency)}
            </span>
          )}
        </div>

        {/* Stock indicator */}
        <div className={cn("text-xs mb-3 flex items-center gap-1", stockColor(product.stock_level, product.in_stock))}>
          <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
          {stockLabel(product.stock_level, product.in_stock)}
        </div>

        {/* Buttons */}
        <div className="flex gap-1.5">
          <button
            onClick={() => onAddToCart({ product, quantity: 1 })}
            disabled={!product.in_stock}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all",
              inCart
                ? "bg-success/20 text-success border border-success/30"
                : product.in_stock
                ? "bg-primary hover:bg-primary-light text-white"
                : "bg-surface-3 text-text-faint cursor-not-allowed"
            )}
          >
            <ShoppingCart size={12} />
            {inCart ? "Added" : "Add"}
          </button>

          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-surface-3 hover:bg-border text-text-muted hover:text-text-primary transition-colors"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
