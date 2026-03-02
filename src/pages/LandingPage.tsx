import React from 'react';
import { ShieldCheck, Camera, History, BarChart3, Leaf, Languages, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const { login } = useAuth();

  const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <div className="glass-card p-6 rounded-2xl animate-in">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent),radial-gradient(circle_at_bottom_left,rgba(2,132,199,0.05),transparent)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left animate-in">
            <div className={cn(badgeVariants({ variant: "outline" }), "mb-6 border-primary/30 text-primary bg-primary/5 px-4 py-1.5 rounded-full")}>
              <Leaf className="w-3.5 h-3.5 mr-2" />
              Sustainability First
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8">
              Scan, Sort, <span className="text-primary italic">Sustain.</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              ExpireX uses AI to combat expired product fraud and food waste. Detect expiry dates instantly, verify authenticity, and get eco-friendly disposal guidance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button size="lg" onClick={login} className="w-full sm:w-auto px-8 rounded-full shadow-lg emerald-glow h-14 text-lg">
                Get Started Securely
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 rounded-full h-14 text-lg bg-white/50 backdrop-blur-sm">
                How it Works
              </Button>
            </div>
            
            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-sm font-medium">Secured by Blink</span>
              </div>
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                <span className="text-sm font-medium">Telugu Support</span>
              </div>
            </div>
          </div>

          <div className="flex-1 relative animate-in [animation-delay:200ms]">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Abstract decorative element */}
              <div className="absolute inset-0 bg-primary/10 rounded-[40px] rotate-6 scale-105 blur-2xl" />
              <div className="absolute inset-0 bg-secondary/10 rounded-[40px] -rotate-3 scale-105 blur-2xl" />
              
              <div className="relative h-full bg-white dark:bg-emerald-950 rounded-[40px] border border-white/20 shadow-2xl overflow-hidden p-4 flex flex-col items-center justify-center">
                <ShieldCheck className="w-32 h-32 text-primary animate-pulse mb-8" />
                <div className="w-full space-y-3">
                  <div className="h-4 bg-muted rounded-full w-3/4 mx-auto animate-pulse" />
                  <div className="h-4 bg-muted rounded-full w-1/2 mx-auto animate-pulse" />
                </div>
              </div>
              
              {/* Floating cards */}
              <div className="absolute -top-8 -right-8 glass-card p-4 rounded-2xl shadow-xl animate-bounce-slow">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <div className="absolute -bottom-8 -left-8 glass-card p-4 rounded-2xl shadow-xl animate-bounce-slow [animation-delay:1s]">
                <BarChart3 className="w-8 h-8 text-secondary" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
          <FeatureCard 
            icon={Camera}
            title="AI Vision Scan"
            desc="Capture front and back product images. Our AI detects expiry dates, batch numbers, and packaging anomalies instantly."
          />
          <FeatureCard 
            icon={Leaf}
            title="Eco Guidance"
            desc="Received personalized reuse, recycling, or disposal steps based on the product's condition and category."
          />
          <FeatureCard 
            icon={Volume2}
            title="Voice Assistant"
            desc="Hands-free interaction. Hear results and guidance in English or Telugu while you manage your inventory."
          />
        </div>
      </div>
    </div>
  );
}
