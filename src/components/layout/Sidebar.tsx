
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, FileText, Users, Settings, Plus, ChevronLeft, ChevronRight,
  Receipt, Repeat, TrendingDown, FileCheck, Moon, Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface SidebarProps {
  isMobile?: boolean;
}

const MENU = [
  { name: 'Dashboard',  path: '/',          icon: Home },
  { name: 'Invoices',   path: '/invoices',  icon: FileText },
  { name: 'Quotes',     path: '/quotes',    icon: FileCheck },
  { name: 'Recurring',  path: '/recurring', icon: Repeat },
  { name: 'Expenses',   path: '/expenses',  icon: TrendingDown },
  { name: 'Clients',    path: '/clients',   icon: Users },
  { name: 'Settings',   path: '/settings',  icon: Settings },
];

export const Sidebar = ({ isMobile = false }: SidebarProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const width = isMobile ? 'w-full' : collapsed ? 'w-16' : 'w-64';

  return (
    <div className={cn(
      "flex flex-col bg-card border-r transition-all duration-300",
      isMobile ? "relative w-full h-full" : `fixed inset-y-0 left-0 z-40 ${width}`,
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center border-b h-16 shrink-0 px-4",
        collapsed && !isMobile ? "justify-center" : "justify-between"
      )}>
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Receipt size={16} className="text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-foreground truncate">Billxo</span>
          </div>
        )}
        {collapsed && !isMobile && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Receipt size={16} className="text-primary-foreground" />
          </div>
        )}

        {!isMobile && (
          <button
            onClick={() => setCollapsed(v => !v)}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* New Invoice CTA */}
      <div className={cn("p-3", collapsed && !isMobile ? "px-2" : "")}>
        <Button
          asChild
          className={cn(
            "w-full gap-2 rounded-xl font-display font-semibold",
            collapsed && !isMobile ? "px-0 justify-center" : ""
          )}
          size={collapsed && !isMobile ? "icon" : "default"}
        >
          <Link to="/invoice/new" aria-label="New Invoice">
            <Plus size={16} />
            {(!collapsed || isMobile) && "New Invoice"}
          </Link>
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {MENU.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center rounded-xl transition-all duration-150 text-sm font-medium",
                collapsed && !isMobile ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              title={collapsed && !isMobile ? item.name : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {(!collapsed || isMobile) && item.name}
            </Link>
          );
        })}
      </nav>

      {/* Dark mode toggle */}
      <div className={cn("border-t p-3", collapsed && !isMobile ? "px-2" : "")}>
        <button
          onClick={toggleTheme}
          className={cn(
            "flex items-center rounded-xl border transition-all text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted w-full",
            collapsed && !isMobile ? "justify-center p-2.5" : "gap-2 px-3 py-2.5"
          )}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {(!collapsed || isMobile) && (isDark ? 'Light Mode' : 'Dark Mode')}
        </button>
      </div>

      {/* Footer */}
      {(!collapsed || isMobile) && (
        <div className="p-4 border-t">
          <p className="text-xs text-muted-foreground text-center">© 2025 Debaprasad</p>
        </div>
      )}
    </div>
  );
};
