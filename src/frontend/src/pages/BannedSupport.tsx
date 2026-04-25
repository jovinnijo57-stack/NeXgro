import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, ShieldAlert, MessageSquare, User, Bot } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "user" | "admin";
  text: string;
  timestamp: number;
}

export default function BannedSupport() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const userEmail = localStorage.getItem("currentUserEmail") || "Guest";

  useEffect(() => {
    const loadMessages = () => {
      const saved = JSON.parse(localStorage.getItem(`nexgro_chat_${userEmail.toLowerCase()}`) || "[]");
      if (saved.length === 0) {
        const initial: Message = {
          id: "1",
          sender: "admin",
          text: `Hello. This is the NeXgro Appeals Department. We noticed your account (${userEmail}) has been suspended. How can we help you today?`,
          timestamp: Date.now(),
        };
        setMessages([initial]);
        localStorage.setItem(`nexgro_chat_${userEmail.toLowerCase()}`, JSON.stringify([initial]));
      } else {
        // Only update if length changed or new content
        if (JSON.stringify(saved) !== JSON.stringify(messages)) {
          setMessages(saved);
        }
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [userEmail, messages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputText,
      timestamp: Date.now(),
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    localStorage.setItem(`nexgro_chat_${userEmail.toLowerCase()}`, JSON.stringify(updated));
    
    // Register this chat in the admin's view
    const activeChats = JSON.parse(localStorage.getItem("nexgro_active_chats") || "[]");
    if (!activeChats.includes(userEmail)) {
      localStorage.setItem("nexgro_active_chats", JSON.stringify([...activeChats, userEmail]));
    }

    setInputText("");
    
    // Fake Admin Reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        sender: "admin",
        text: "Thank you for your appeal. An administrator has been notified and will review your case shortly. Please stay on this page.",
        timestamp: Date.now(),
      };
      const final = [...updated, reply];
      setMessages(final);
      localStorage.setItem(`nexgro_chat_${userEmail.toLowerCase()}`, JSON.stringify(final));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => window.location.href = "/banned"} className="p-2 hover:bg-muted rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-display font-bold text-foreground">Appeals Support</h1>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black text-emerald-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Agent Online
            </div>
          </div>
        </div>
        <div className="px-3 py-1 bg-destructive/10 text-destructive text-[10px] font-bold rounded-full border border-destructive/20 flex items-center gap-1.5">
          <ShieldAlert className="w-3 h-3" />
          Account Restricted
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="max-w-md mx-auto py-8 text-center space-y-3 opacity-50">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">This conversation is being recorded for security purposes. Your appeal will be reviewed by the NeXgro Admin Team.</p>
        </div>

        {messages.map((m) => (
          <div key={m.id} className={cn("flex w-full", m.sender === "user" ? "justify-end" : "justify-start animate-in slide-in-from-left-2")}>
            <div className={cn("flex gap-3 max-w-[85%]", m.sender === "user" && "flex-row-reverse")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", m.sender === "user" ? "bg-primary text-white" : "bg-muted text-foreground")}>
                {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn("space-y-1", m.sender === "user" && "items-end")}>
                <div className={cn("px-4 py-3 rounded-2xl text-sm shadow-sm", m.sender === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-border text-foreground rounded-tl-none")}>
                  {m.text}
                </div>
                <p className="text-[10px] text-muted-foreground px-1">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-background border-t border-border sticky bottom-0">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Describe your appeal details here..."
            className="flex-1 bg-muted border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-foreground"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-90 disabled:opacity-50 disabled:grayscale"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
