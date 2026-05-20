
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from '../ui/button';
import NotificationsBanner from '@/components/NotificationsBanner';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden ml-2 mt-2 shrink-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0">
          <Sidebar isMobile />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex-1 overflow-auto md:ml-64">
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <NotificationsBanner />
          {children}
        </main>
      </div>

      <Toaster />
      <Sonner />
    </div>
  );
};
