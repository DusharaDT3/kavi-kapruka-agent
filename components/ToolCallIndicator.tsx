"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, MapPin, Truck, ShoppingBag, Loader2 } from "lucide-react";
import { toolDisplayName } from "@/lib/utils";
import type { ToolCallState } from "@/types";

const toolIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  kapruka_search_products: Search,
  kapruka_get_product: Package,
  kapruka_list_categories: Search,
  kapruka_list_delivery_cities: MapPin,
  kapruka_check_delivery: Truck,
  kapruka_create_order: ShoppingBag,
  kapruka_track_order: Truck,
};

interface ToolCallIndicatorProps {
  toolCalls: ToolCallState[];
}

export function ToolCallIndicator({ toolCalls }: ToolCallIndicatorProps) {
  const activeCalls = toolCalls.filter((tc) => tc.status === "calling");

  return (
    <AnimatePresence>
      {activeCalls.map((tc) => {
        const Icon = toolIcons[tc.toolName] || Loader2;
        return (
          <motion.div
            key={tc.toolUseId}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2.5 px-4 py-2"
          >
            <div className="w-8 h-8 rounded-full bg-kavi-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              K
            </div>
            <div className="flex items-center gap-2 bg-surface border border-border rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-text-muted">
              <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin flex-shrink-0" />
              <Icon size={13} className="text-accent flex-shrink-0" />
              <span className="text-xs">{toolDisplayName(tc.toolName)}...</span>
            </div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}
