import { useOrderById } from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Box,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function OrderTrackingPage() {
  const { orderId } = useParams({ from: "/orders/$orderId/track" });
  const { data: order } = useOrderById(orderId);
  const [driverPos, setDriverPos] = useState({ lat: 28.6139, lng: 77.209 });
  
  // Mock driver movement
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverPos((prev) => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { label: "Ordered", icon: Box, completed: true, time: "10:30 AM" },
    { label: "Processing", icon: Clock, completed: true, time: "10:45 AM" },
    { label: "Shipped", icon: Truck, completed: true, time: "11:05 AM" },
    { label: "Out for Delivery", icon: Navigation, completed: true, time: "11:15 AM" },
    { label: "Delivered", icon: CheckCircle2, completed: false, time: "Expected 11:30 AM" },
  ];

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-background flex flex-col" data-ocid="order-tracking.page">
      {/* Map Header */}
      <div className="relative h-72 bg-muted/30 overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-primary/5" />
        
        {/* Back button */}
        <Link
          to="/orders/$orderId"
          params={{ orderId }}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-foreground z-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Driver Marker Mock with 3D Effect */}
        <div 
          className="absolute w-16 h-16 transition-all duration-1000 ease-in-out z-20 group"
          style={{ 
            left: `${40 + (driverPos.lat % 0.01) * 1000}%`, 
            top: `${35 + (driverPos.lng % 0.01) * 1000}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Pulsing Aura */}
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75" />
          
          <div className="relative w-full h-full bg-primary rounded-2xl border-4 border-white shadow-[0_10px_20px_-5px_rgba(22,163,74,0.4)] flex items-center justify-center rotate-[-15deg] group-hover:rotate-0 transition-transform">
            <Truck className="w-8 h-8 text-white" />
            
            {/* 3D Depth Shadow */}
            <div className="absolute -bottom-2 -right-2 w-full h-full bg-black/10 rounded-2xl -z-10" />
          </div>
          
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg border border-border flex items-center gap-2 whitespace-nowrap">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Rahul · Active</span>
          </div>
        </div>

        {/* User Marker Mock */}
        <div 
          className="absolute w-12 h-12 bg-accent rounded-full border-4 border-white shadow-[0_0_20px_rgba(249,115,22,0.3)] flex items-center justify-center z-10 animate-bounce"
          style={{ left: '70%', top: '65%' }}
        >
          <MapPin className="w-6 h-6 text-white" />
        </div>

        {/* Decorative Grid / Map Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20" 
          style={{ 
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', 
            backgroundSize: '30px 30px' 
          }} 
        />
      </div>

      {/* Delivery Status Card */}
      <div className="flex-1 bg-background -mt-6 rounded-t-3xl border-t border-border p-6 shadow-2xl relative z-30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">Delivery in Progress</h1>
            <p className="text-sm text-muted-foreground">Order {orderId}</p>
          </div>
          <div className="bg-primary/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">15 mins away</span>
          </div>
        </div>

        {/* Driver Info */}
        <div className="bg-muted/40 rounded-2xl p-4 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg">
              R
            </div>
            <div>
              <p className="font-bold text-foreground">Rahul Kumar</p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-muted-foreground font-medium">Verified NeXgro Partner</span>
              </div>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform">
            <Phone className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline */}
        <div className="space-y-6 relative ml-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
          {steps.map((step, i) => (
            <div key={step.label} className="flex gap-4 relative">
              <div className={cn(
                "w-6 h-6 rounded-full border-4 border-background z-10 flex items-center justify-center shrink-0",
                step.completed ? "bg-primary" : "bg-muted"
              )}>
                {step.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={cn(
                    "text-sm font-bold",
                    step.completed ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </p>
                  <span className="text-[10px] text-muted-foreground font-medium">{step.time}</span>
                </div>
                {i === steps.findIndex(s => !s.completed) - 1 && (
                  <p className="text-xs text-primary font-medium mt-0.5 animate-pulse">Your driver is near your location!</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Security Note */}
        <div className="mt-8 pt-6 border-t border-border flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <ShieldCheck className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Contactless Delivery</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              For your safety, our partners follow all hygiene protocols. Your order will be left at your doorstep.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
