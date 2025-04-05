
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import useLocalStorage from '@/hooks/useLocalStorage';

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('darkMode', false);

  // Immediately reflect dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <AppLayout>
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">Settings</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Customize your application experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode" className="text-base font-medium">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for the entire application
                  </p>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={darkMode} 
                  onCheckedChange={setDarkMode} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
