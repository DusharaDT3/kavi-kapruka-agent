"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ShoppingCart, Loader2 } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { ToolCallIndicator } from "./ToolCallIndicator";
import { CartPanel } from "./CartPanel";
import { WelcomeScreen } from "./WelcomeScreen";
import { cn, generateId } from "@/lib/utils";
import type {
  ChatMessage,
  CartItem,
  ToolCallState,
  ToolResult,
  StreamEvent,
} from "@/types";

interface ApiMessage {
  role: "user" | "assistant";
  content: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [activeToolCalls, setActiveToolCalls] = useState<ToolCallState[]>([]);
  const [pendingToolResults, setPendingToolResults] = useState<ToolResult[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartProductIds = new Set(cart.map((i) => i.product.id));

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, activeToolCalls, scrollToBottom]);

  const getApiMessages = (msgs: ChatMessage[]): ApiMessage[] =>
    msgs.map((m) => ({ role: m.role, content: m.content }));

  const sendMessage = useCallback(
    async (text?: string) => {
      const userText = (text ?? input).trim();
      if (!userText || isLoading) return;

      setInput("");
      setIsLoading(true);
      setStreamingContent("");
      setActiveToolCalls([]);
      setPendingToolResults([]);

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: userText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);

      // Resize textarea
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      const allMessages = [...messages, userMsg];

      abortRef.current = new AbortController();

      let accText = "";
      const localToolResults: ToolResult[] = [];

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: getApiMessages(allMessages) }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event = JSON.parse(line.slice(6)) as StreamEvent;

              if (event.type === "text") {
                accText += event.content;
                setStreamingContent(accText);
              } else if (event.type === "tool_call") {
                setActiveToolCalls((prev) => [
                  ...prev,
                  {
                    toolUseId: event.toolUseId,
                    toolName: event.toolName,
                    status: "calling",
                  },
                ]);
              } else if (event.type === "tool_result") {
                setActiveToolCalls((prev) =>
                  prev.map((tc) =>
                    tc.toolUseId === event.toolUseId
                      ? { ...tc, status: "done" }
                      : tc
                  )
                );
                const tr: ToolResult = {
                  toolName: event.toolName,
                  toolUseId: event.toolUseId,
                  result: event.result,
                };
                localToolResults.push(tr);
                setPendingToolResults([...localToolResults]);
              } else if (event.type === "done") {
                // Finalize assistant message
                const assistantMsg: ChatMessage = {
                  id: generateId(),
                  role: "assistant",
                  content: accText,
                  toolResults: localToolResults.length > 0 ? [...localToolResults] : undefined,
                  timestamp: new Date(),
                };
                setMessages((prev) => [...prev, assistantMsg]);
                setStreamingContent("");
                setActiveToolCalls([]);
                setPendingToolResults([]);
              } else if (event.type === "error") {
                throw new Error(event.message);
              }
            } catch (parseErr) {
              // Skip malformed lines
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          const errMsg: ChatMessage = {
            id: generateId(),
            role: "assistant",
            content: "Sorry, something went wrong. Please try again!",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errMsg]);
        }
        setStreamingContent("");
        setActiveToolCalls([]);
        setPendingToolResults([]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [input, isLoading, messages]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === item.product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === item.product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const updateCartQuantity = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) =>
          i.product.id === productId ? { ...i, quantity: qty } : i
        )
      );
    }
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const handleCheckout = useCallback(() => {
    if (cart.length === 0) return;
    setCartOpen(false);

    const cartSummary = cart
      .map((i) => `${i.quantity}x ${i.product.name}`)
      .join(", ");

    sendMessage(
      `I'd like to checkout with: ${cartSummary}. Please help me complete the order.`
    );
  }, [cart, sendMessage]);

  const showWelcome = messages.length === 0 && !isLoading;
  const showStreamingBubble = isLoading && (streamingContent || activeToolCalls.length > 0);

  return (
    <div className="flex flex-col h-screen bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/80 backdrop-blur-sm z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-kavi-gradient flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-primary/40">
            K
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary leading-tight">Kavi</h1>
            <p className="text-[10px] text-text-faint leading-tight">
              Powered by Kapruka.com 🇱🇰
            </p>
          </div>
        </div>

        {/* Cart button */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-full
            bg-surface-2 border border-border text-text-muted hover:border-primary/50
            hover:text-text-primary transition-all text-sm"
        >
          <ShoppingCart size={16} />
          {cartCount > 0 && (
            <motion.span
              key={cartCount}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary
                text-white text-[10px] font-bold flex items-center justify-center shadow-md"
            >
              {cartCount}
            </motion.span>
          )}
          <span className="text-xs hidden sm:inline">Cart</span>
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {showWelcome ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <WelcomeScreen onSuggestion={(text) => sendMessage(text)} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              className="py-4"
            >
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onAddToCart={addToCart}
                  cartProductIds={cartProductIds}
                />
              ))}

              {/* Active tool calls */}
              <ToolCallIndicator toolCalls={activeToolCalls} />

              {/* Streaming message */}
              {showStreamingBubble && streamingContent && (
                <MessageBubble
                  message={{
                    id: "streaming",
                    role: "assistant",
                    content: streamingContent,
                    toolResults: pendingToolResults.length > 0 ? pendingToolResults : undefined,
                    timestamp: new Date(),
                  }}
                  onAddToCart={addToCart}
                  cartProductIds={cartProductIds}
                  isStreaming
                />
              )}

              {/* Thinking indicator (before text arrives) */}
              {isLoading && !streamingContent && activeToolCalls.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 px-4 py-2"
                >
                  <div className="w-8 h-8 rounded-full bg-kavi-gradient flex items-center justify-center text-white font-bold text-sm">
                    K
                  </div>
                  <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-2 h-2 rounded-full bg-text-muted animate-pulse-dot"
                          style={{ animationDelay: `${i * 0.16}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-surface/80 backdrop-blur-sm px-4 py-3">
        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask Kavi anything — gifts, cakes, flowers, electronics..."
              rows={1}
              className={cn(
                "w-full resize-none rounded-2xl px-4 py-3 pr-12",
                "bg-surface-2 border border-border",
                "text-sm text-text-primary placeholder:text-text-faint",
                "focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30",
                "transition-colors leading-relaxed",
                "min-h-[48px] max-h-[120px]"
              )}
              style={{ height: "48px" }}
              disabled={isLoading}
            />
          </div>

          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
              input.trim() && !isLoading
                ? "bg-kavi-gradient text-white shadow-md shadow-primary/30 hover:opacity-90 active:scale-95"
                : "bg-surface-3 text-text-faint cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>

        <p className="text-center text-[10px] text-text-faint mt-2">
          Powered by Claude AI · Kapruka live catalog
        </p>
      </div>

      {/* Cart Panel */}
      <CartPanel
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
