import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { 
  LayoutDashboard, 
  Camera, 
  History, 
  BarChart3, 
  Settings, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Scan', icon: Camera, href: '/scan' },
  { label: 'History', icon: History, href: '/history' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const NavLink = ({ item, isMobile = false }: { item: typeof navItems[0], isMobile?: boolean }) => {
    const isActive = currentPath === item.href;
    return (
      <Link
        to={item.href}
        className={cn(
          "flex flex-col lg:flex-row items-center gap-1 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all duration-200",
          isActive 
            ? "text-primary lg:bg-primary/10" 
            : "text-muted-foreground hover:text-primary hover:bg-primary/5",
          isMobile && "flex-1"
        )}
      >
        <item.icon className={cn("w-6 h-6", isActive && "emerald-glow")} />
        <span className="text-[10px] lg:text-sm font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* PC Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen border-r bg-card shadow-sm p-4 animate-in">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg emerald-glow">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">ExpireX</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Scan & Sustain</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-4 border-t">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="w-10 h-10 border-2 border-primary/20">
              <AvatarImage src={user?.avatar || ''} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.displayName || 'User'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl"
            onClick={logout}
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-card border-t flex items-center justify-around px-4 z-50 animate-in pb-safe">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} isMobile />
        ))}
        <button 
          onClick={logout}
          className="flex flex-col items-center gap-1 text-muted-foreground flex-1"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] font-medium">Sign Out</span>
        </button>
      </nav>
    </>
  );
}
