import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  History, 
  TrendingUp, 
  Leaf, 
  AlertTriangle, 
  ShieldCheck,
  Calendar,
  ChevronRight,
  Package,
  ArrowUpRight,
  Languages,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { blink } from '@/lib/blink';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

import { useLanguage } from '@/hooks/useLanguage';

export default function Dashboard() {
  const { user } = useAuth();
  const { t, lang, toggleLang } = useLanguage();
  const [stats, setStats] = useState({
    total: 0,
    safe: 0,
    expired: 0,
    recent: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const scans = await blink.db.scans.list({
          orderBy: { createdAt: 'desc' },
          limit: 10
        });
        
        const safe = scans.filter((s: any) => s.status === 'Safe').length;
        const expired = scans.filter((s: any) => s.status === 'Expired').length;
        
        setStats({
          total: scans.length,
          safe,
          expired,
          recent: scans.slice(0, 5)
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const StatCard = ({ icon: Icon, label, value, color, trend }: any) => (
    <Card className="overflow-hidden border-none shadow-sm glass-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-2xl", color)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </div>
          )}
        </div>
        <h4 className="text-sm font-medium text-muted-foreground mb-1">{label}</h4>
        <p className="text-3xl font-extrabold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 space-y-12 animate-in pb-32 lg:pb-16">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight mb-2">
            {t.welcome}, <span className="text-primary">{user?.displayName?.split(' ')[0] || 'Explorer'}!</span>
          </h2>
          <p className="text-muted-foreground">Keep your household safe and sustain the environment.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button asChild size="lg" className="rounded-2xl shadow-lg emerald-glow gap-2 h-14 px-6">
            <Link to="/scan">
              <Plus className="w-5 h-5" />
              {t.startScan}
            </Link>
          </Button>
          <Button variant="outline" size="lg" onClick={toggleLang} className="rounded-2xl h-14 px-6 gap-2 bg-card/50">
            <Languages className="w-5 h-5" />
            Language: {lang.toUpperCase()}
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Package} 
          label="Total Scanned" 
          value={stats.total} 
          color="bg-secondary" 
          trend="+12% this week"
        />
        <StatCard 
          icon={ShieldCheck} 
          label="Safe Items" 
          value={stats.safe} 
          color="bg-primary"
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Expired Found" 
          value={stats.expired} 
          color="bg-destructive"
        />
        <StatCard 
          icon={Leaf} 
          label="Eco-Impact Score" 
          value="85" 
          trend="Top 10%" 
          color="bg-emerald-500"
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm glass-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Recent Scans
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-primary/5 rounded-full">
              <Link to="/history">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {stats.recent.length > 0 ? (
              <div className="divide-y">
                {stats.recent.map((scan: any) => (
                  <Link 
                    key={scan.id} 
                    to="/history" 
                    className="flex items-center gap-4 p-4 hover:bg-primary/5 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden">
                      <img src={scan.imageFront} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate group-hover:text-primary transition-colors">{scan.productName || 'Unknown Product'}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </span>
                        <Badge variant={scan.status === 'Safe' ? 'default' : 'destructive'} className="text-[9px] px-1.5 py-0 rounded-full font-bold">
                          {scan.status}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No recent scans yet.</p>
                <Button variant="outline" asChild className="rounded-full">
                  <Link to="/scan">Start your first scan</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm glass-card bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-2xl" />
          
          <CardContent className="p-8 relative h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-md">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 leading-tight">Combat Waste, <br/>Promote Safety.</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-8">
                Every scan helps prevent foodborne illness and reduces landfill waste through guided recycling steps.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold border-t border-white/20 pt-4">
                <span>Weekly Sustainability Goal</span>
                <span>85%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[85%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
