
import { ReactNode, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import useLocalStorage from '@/hooks/useLocalStorage';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from '../ui/button';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [darkMode] = useLocalStorage<boolean>('darkMode', false);

  // Apply dark mode class immediately
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // This additional code ensures immediate reflection without waiting for the effect
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      
      {/* Mobile Sidebar */}
      <div className="flex md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-2 mt-2">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-0">
            <Sidebar isMobile />
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="flex-1 overflow-auto md:ml-64">
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <Toaster />
      <Sonner />
    </div>
  );
};
