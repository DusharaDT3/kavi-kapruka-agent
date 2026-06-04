"use client";

import { motion } from "framer-motion";
import { CheckCircle, ExternalLink, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { OrderCreated } from "@/types";

interface OrderConfirmationProps {
  order: OrderCreated;
}

export function OrderConfirmation({ order }: OrderConfirmationProps) {
  const { checkout_url, order_ref, summary, expires_at } = order;
  const currency = summary?.currency || "LKR";

  const expiresDate = expires_at ? new Date(expires_at) : null;
  const expiresDisplay = expiresDate
    ? expiresDate.toLocaleTimeString("en-LK", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Colombo",
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="mt-3 w-full max-w-sm rounded-2xl border border-success/30 bg-success/5 p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle size={18} className="text-success" />
        <span className="font-semibold text-success text-sm">Order ready!</span>
        <span className="ml-auto text-xs text-text-muted font-mono">{order_ref}</span>
      </div>

      {summary && (
        <div className="space-y-1.5 mb-4 text-sm">
          <div className="flex justify-between text-text-muted">
            <span>Items</span>
            <span>{formatPrice(summary.items_total, currency)}</span>
          </div>
          <div className="flex justify-between text-text-muted">
            <span>Delivery</span>
            <span>{formatPrice(summary.delivery_fee, currency)}</span>
          </div>
          <div className="flex justify-between font-semibold text-text-primary border-t border-border pt-1.5 mt-1.5">
            <span>Total</span>
            <span className="text-accent">{formatPrice(summary.grand_total, currency)}</span>
          </div>
        </div>
      )}

      {checkout_url && (
        <a
          href={checkout_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
            bg-success hover:bg-success/90 text-white font-semibold text-sm transition-colors"
        >
          Pay now
          <ExternalLink size={14} />
        </a>
      )}

      {expiresDisplay && (
        <div className="flex items-center gap-1.5 mt-2.5 text-xs text-text-muted">
          <Clock size={11} />
          <span>Link expires at {expiresDisplay} — prices locked until then</span>
        </div>
      )}
    </motion.div>
  );
}
