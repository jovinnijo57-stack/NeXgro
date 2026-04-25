import { Button } from "@/components/ui/button";
import { useGetChatMessages, useSendChatMessage } from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import { MessageCircle, Minimize2, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: messages = [], refetch } = useGetChatMessages();
  const sendMessage = useSendChatMessage();

  // Count unread (from admin, after widget was last opened)
  const unreadCount = messages.filter(
    (m) => m.sender === "admin" && !open,
  ).length;

  // Auto-scroll to bottom
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  // Polling for new messages
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => refetch(), 3000);
    return () => clearInterval(interval);
  }, [open, refetch]);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessage.mutateAsync(text);
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded chat panel */}
      {open && (
        <div
          className="w-[300px] sm:w-[320px] h-[420px] bg-card border border-border rounded-2xl shadow-elevated flex flex-col overflow-hidden animate-slide-in"
          data-ocid="chat_widget.dialog"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">
                  NeXgro Support
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <span className="text-[10px] text-primary-foreground/80">
                    Online
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-primary-foreground/20 transition-colors"
                aria-label="Minimize"
                data-ocid="chat_widget.close_button"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-primary-foreground/20 transition-colors"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-background">
            {messages.length === 0 && (
              <div
                className="text-center text-sm text-muted-foreground py-8"
                data-ocid="chat_widget.empty_state"
              >
                No messages yet. Say hello! 👋
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.sender === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm border border-border",
                  )}
                >
                  <p className="break-words">
                    {msg.text.split(/(nexgrostore@gmail\.com)/).map((part, i) =>
                      part === "nexgrostore@gmail.com" ? (
                        <a
                          key={i}
                          href="mailto:nexgrostore@gmail.com"
                          className={cn("underline font-medium", msg.sender === "user" ? "text-primary-foreground" : "text-primary")}
                        >
                          nexgrostore@gmail.com
                        </a>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  </p>
                  <p
                    className={cn(
                      "text-[10px] mt-1",
                      msg.sender === "user"
                        ? "text-primary-foreground/70 text-right"
                        : "text-muted-foreground",
                    )}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {sendMessage.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted border border-border rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-border bg-card shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-w-0 px-3 py-2 text-sm rounded-full border border-border bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                data-ocid="chat_widget.input"
              />
              <Button
                size="icon"
                className="w-8 h-8 rounded-full shrink-0"
                onClick={handleSend}
                disabled={!input.trim() || sendMessage.isPending}
                data-ocid="chat_widget.send_button"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-14 h-14 rounded-full shadow-elevated flex items-center justify-center transition-all duration-200 relative",
          "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95",
        )}
        aria-label={open ? "Close support chat" : "Open support chat"}
        data-ocid="chat_widget.toggle_button"
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
        {/* Unread badge */}
        {!open && unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
            data-ocid="chat_widget.unread_badge"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
