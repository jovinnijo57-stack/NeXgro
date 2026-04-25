import { useState } from "react";
import { Calendar, RefreshCw, Star, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

const SUBSCRIPTIONS = [
  {
    id: "sub1",
    title: "Daily Fresh Dairy",
    price: "$29.99",
    frequency: "Weekly",
    items: ["2x Organic Milk", "1x Farm Eggs (Dozen)", "1x Fresh Butter"],
    popular: true,
    color: "oklch(0.55 0.18 220)", // Dairy blue
  },
  {
    id: "sub2",
    title: "Morning Essentials",
    price: "$45.00",
    frequency: "Weekly",
    items: ["1x Fresh Bread", "Bananas (6 pcs)", "Premium Coffee Beans"],
    popular: false,
    color: "oklch(0.58 0.21 33)", // Orange accent
  },
  {
    id: "sub3",
    title: "Healthy Snack Pack",
    price: "$35.50",
    frequency: "Bi-Weekly",
    items: ["Mixed Nuts", "Protein Bars", "Fresh Berries", "Greek Yogurt"],
    popular: false,
    color: "oklch(0.48 0.16 142)", // Primary green
  }
];

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState("discover");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-10 mt-4">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Smart Subscriptions
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Set it and forget it. Get your daily essentials delivered automatically, and save up to 15% on every order.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-muted p-1 rounded-xl flex gap-1">
          <button
            onClick={() => setActiveTab("discover")}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "discover" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            Discover Plans
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "manage" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            My Subscriptions (0)
          </button>
        </div>
      </div>

      {activeTab === "discover" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBSCRIPTIONS.map((sub) => (
            <div key={sub.id} className="bg-card rounded-3xl border border-border overflow-hidden flex flex-col relative transition-transform hover:-translate-y-1 hover:shadow-xl duration-300">
              {sub.popular && (
                <div className="absolute top-0 inset-x-0 h-1 bg-accent" style={{background: "oklch(0.58 0.21 33)"}}></div>
              )}
              {sub.popular && (
                <div className="absolute top-4 right-4 bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1" style={{color: "oklch(0.58 0.21 33)"}}>
                  <Star className="w-3 h-3 fill-accent" /> Most Popular
                </div>
              )}
              
              <div className="p-8 pb-6 border-b border-border/50">
                <h3 className="font-display text-xl font-bold mb-2 text-foreground">{sub.title}</h3>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-bold text-primary" style={{color: sub.color}}>{sub.price}</span>
                  <span className="text-sm font-medium text-muted-foreground mb-1">/ {sub.frequency.toLowerCase()}</span>
                </div>
              </div>
              
              <div className="p-8 pt-6 flex-1 flex flex-col">
                <h4 className="text-sm font-semibold mb-4 text-foreground">Includes:</h4>
                <ul className="space-y-3 mb-8 flex-1">
                  {sub.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" style={{color: sub.color}} />
                      {item}
                    </li>
                  ))}
                </ul>
                
                <button className="w-full py-3.5 rounded-xl font-bold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2" style={{backgroundColor: sub.color}}>
                  Subscribe Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "manage" && (
        <div className="bg-card rounded-3xl border border-border p-12 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <RefreshCw className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">No active subscriptions</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            You aren't subscribed to any recurring deliveries yet. Browse our plans to get started and save on your favorites.
          </p>
          <button 
            onClick={() => setActiveTab("discover")}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Explore Plans
          </button>
        </div>
      )}
    </div>
  );
}
