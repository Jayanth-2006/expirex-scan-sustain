import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  Filter, 
  Trash2, 
  ChevronRight, 
  Clock, 
  Package,
  AlertTriangle,
  CheckCircle2,
  Trash
} from 'lucide-react';
import { blink } from '@/lib/blink';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

export default function HistoryPage() {
  const { user } = useAuth();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const data = await blink.db.scans.list({
        orderBy: { createdAt: 'desc' }
      });
      setScans(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const deleteScan = async (id: string) => {
    try {
      await blink.db.scans.delete(id);
      setScans(scans.filter(s => s.id !== id));
      toast.success('Scan removed from history');
    } catch (err) {
      toast.error('Failed to delete scan');
    }
  };

  const filteredScans = scans.filter(scan => 
    (scan.productName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16 animate-in pb-32">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Scan History</h1>
        <p className="text-muted-foreground max-w-xl">Review your past product safety checks and sustainability guidance.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search products..." 
            className="pl-12 h-14 rounded-2xl bg-card border-none shadow-sm focus-visible:ring-primary focus-visible:ring-offset-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-14 px-6 rounded-2xl gap-2 bg-card border-none shadow-sm">
          <Filter className="w-5 h-5" />
          Filters
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner className="w-10 h-10 text-primary mb-4" />
          <p className="text-muted-foreground">Loading your history...</p>
        </div>
      ) : filteredScans.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredScans.map((scan) => (
            <Card key={scan.id} className="border-none shadow-sm glass-card group overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-6 gap-6">
                  <div className="w-full sm:w-24 aspect-square rounded-2xl overflow-hidden border shadow-sm flex-shrink-0">
                    <img src={scan.imageFront} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge 
                        variant={scan.status === 'Safe' ? 'default' : 'destructive'} 
                        className={cn(
                          "px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          scan.status === 'Safe' ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {scan.status === 'Safe' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                        {scan.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold truncate mb-2 group-hover:text-primary transition-colors">
                      {scan.productName || 'Unknown Product'}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground">Expiry Date</p>
                        <p className="font-bold">{scan.expiryDate || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Batch #</p>
                        <p className="font-bold">{scan.batchNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                      onClick={() => deleteScan(scan.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground group-hover:text-primary group-hover:bg-primary/5">
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-[32px] border-2 border-dashed border-muted shadow-sm">
          <Package className="w-16 h-16 text-muted mx-auto mb-6 opacity-20" />
          <h3 className="text-xl font-bold mb-2">No scans found</h3>
          <p className="text-muted-foreground mb-8">Start scanning products to see your history here.</p>
          <Button asChild className="rounded-full shadow-lg emerald-glow px-8 h-14">
            <Link to="/scan">Scan your first product</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
