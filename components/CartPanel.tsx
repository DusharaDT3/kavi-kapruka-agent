"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag, Package, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types";

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

export function CartPanel({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}: CartPanelProps) {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.product.price?.amount ?? 0) * item.quantity;
  }, 0);

  const currency = items[0]?.product.price?.currency || "LKR";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-bg/60 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-surface border-l border-border z-50
              flex flex-col shadow-2xl shadow-black/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-primary-light" />
                <h2 className="font-semibold text-text-primary">Your Cart</h2>
                {items.length > 0 && (
                  <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {items.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-3">
              <AnimatePresence>
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-48 text-center px-6"
                  >
                    <ShoppingBag size={36} className="text-text-faint mb-3" />
                    <p className="text-text-muted text-sm">Your cart is empty</p>
                    <p className="text-text-faint text-xs mt-1">
                      Ask Kavi to find something you love!
                    </p>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      className="flex gap-3 px-4 py-3 border-b border-border/50"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl bg-surface-2 overflow-hidden flex-shrink-0">
                        {item.product.image_url || item.product.images?.[0] ? (
                          <Image
                            src={item.product.image_url || item.product.images![0]}
                            alt={item.product.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={20} className="text-text-faint" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary font-medium line-clamp-2 leading-tight">
                          {item.product.name}
                        </p>
                        <p className="text-accent text-sm font-semibold mt-1">
                          {formatPrice(
                            (item.product.price?.amount ?? 0) * item.quantity,
                            item.product.price?.currency
                          )}
                        </p>

                        {/* Qty controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="w-6 h-6 rounded-md bg-surface-3 hover:bg-border text-text-muted
                              hover:text-text-primary transition-colors flex items-center justify-center"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-semibold w-4 text-center text-text-primary">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="w-6 h-6 rounded-md bg-surface-3 hover:bg-border text-text-muted
                              hover:text-text-primary transition-colors flex items-center justify-center"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => onRemove(item.product.id)}
                            className="ml-auto p-1 rounded-md text-text-faint hover:text-error transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border px-5 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">Subtotal</span>
                  <span className="text-text-primary font-semibold">
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>
                <p className="text-xs text-text-faint">
                  Delivery charges calculated at checkout
                </p>
                <button
                  onClick={onCheckout}
                  className="w-full py-3 rounded-xl bg-kavi-gradient text-white font-semibold
                    hover:opacity-90 active:opacity-80 transition-opacity shadow-md shadow-primary/30"
                >
                  Proceed to Checkout
                </button>
                <p className="text-xs text-center text-text-faint">
                  No Kapruka account needed · Pay on Kapruka securely
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
