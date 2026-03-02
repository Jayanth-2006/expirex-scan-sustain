import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Leaf, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar,
  ChevronDown,
  PieChart as PieChartIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { blink } from '@/lib/blink';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    total: 0,
    safe: 0,
    expired: 0,
    atRisk: 0,
    impact: 85
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const scans = await blink.db.scans.list();
        const safe = scans.filter((s: any) => s.status === 'Safe').length;
        const expired = scans.filter((s: any) => s.status === 'Expired').length;
        const atRisk = scans.filter((s: any) => s.status === 'At Risk').length;
        
        setData({
          total: scans.length,
          safe,
          expired,
          atRisk,
          impact: 85 // Mock impact score
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const DistributionBar = ({ label, value, total, color }: any) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-sm font-bold">{label}</span>
          <span className="text-xs text-muted-foreground">{value} items ({Math.round(percentage)}%)</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all duration-1000 ease-out", color)} 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="w-10 h-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 animate-in pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Usage Insights</h1>
          <p className="text-muted-foreground">Detailed analysis of your scanned products and environmental footprint.</p>
        </div>
        <Button variant="outline" className="rounded-2xl gap-2 shadow-sm border-none bg-card px-6 h-14">
          <Calendar className="w-5 h-5 text-primary" />
          Last 30 Days
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-none shadow-sm glass-card lg:col-span-2">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-primary" />
              Safety Distribution
            </CardTitle>
            <CardDescription>Product status overview for all lifetime scans.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-12 space-y-8">
            <DistributionBar 
              label="Safe to Use" 
              value={data.safe} 
              total={data.total} 
              color="bg-primary shadow-[0_0_15px_rgba(13,148,136,0.4)]"
            />
            <DistributionBar 
              label="Expired" 
              value={data.expired} 
              total={data.total} 
              color="bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            />
            <DistributionBar 
              label="At Risk / Warning" 
              value={data.atRisk} 
              total={data.total} 
              color="bg-accent shadow-[0_0_15px_rgba(245,158,11,0.4)]"
            />
            
            <div className="pt-8 border-t border-muted grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-black text-primary">{data.total}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Lifetime</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-secondary">14</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">This Month</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-accent">2</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Fraud Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm glass-card flex flex-col">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Leaf className="w-6 h-6 text-emerald-500" />
              Eco-Impact
            </CardTitle>
            <CardDescription>Sustainability contribution tracking.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-12 flex-1 flex flex-col justify-center text-center space-y-8">
            <div className="relative inline-flex items-center justify-center mx-auto">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  className="text-muted"
                  strokeWidth="12"
                  stroke="currentColor"
                  fill="transparent"
                  r="80"
                  cx="96"
                  cy="96"
                />
                <circle
                  className="text-emerald-500 transition-all duration-1000 ease-out"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 80}
                  strokeDashoffset={2 * Math.PI * 80 * (1 - data.impact / 100)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="80"
                  cx="96"
                  cy="96"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black">{data.impact}</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Score</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-left flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-700">Excellent Progress</p>
                  <p className="text-[10px] text-emerald-600/70 leading-tight">You've diverted 4.2kg of waste this week.</p>
                </div>
              </div>
              
              <Button className="w-full rounded-2xl h-14 font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg">
                <TrendingUp className="w-5 h-5" />
                View Detailed Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {[
          { label: 'Weekly Scans', value: '42', trend: '+12%', up: true, icon: Activity },
          { label: 'Recycled Items', value: '18', trend: '+5%', up: true, icon: Leaf },
          { label: 'Fraud Detected', value: '0', trend: '0%', up: null, icon: ShieldCheck },
          { label: 'Avg Shelf Life', value: '14d', trend: '-2d', up: false, icon: Calendar },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm glass-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                  <stat.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                {stat.up !== null && (
                  <div className={cn(
                    "flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full",
                    stat.up ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                  )}>
                    {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.trend}
                  </div>
                )}
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-2xl font-black tracking-tight">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
