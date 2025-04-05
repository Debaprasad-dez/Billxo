
import { useState } from 'react';
import { Business } from '@/types/invoice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import useLocalStorage from '@/hooks/useLocalStorage';

interface BusinessFormProps {
  business: Business;
  onUpdate: (business: Business) => void;
}

export const BusinessForm = ({ business, onUpdate }: BusinessFormProps) => {
  const [savedBusinesses, setSavedBusinesses] = useLocalStorage<Business[]>('businesses', []);
  const [logoPreview, setLogoPreview] = useState<string | null>(business.logo || null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdate({ ...business, [name]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogoPreview(base64String);
      onUpdate({ ...business, logo: base64String });
    };
    reader.readAsDataURL(file);
  };

  const saveBusiness = () => {
    // Check if this business already exists by name
    const existingIndex = savedBusinesses.findIndex(b => b.name === business.name);
    
    if (existingIndex >= 0) {
      // Update existing business
      const updated = [...savedBusinesses];
      updated[existingIndex] = business;
      setSavedBusinesses(updated);
    } else {
      // Add new business
      setSavedBusinesses([...savedBusinesses, business]);
    }
  };

  const loadBusiness = (selectedBusiness: Business) => {
    onUpdate(selectedBusiness);
    setLogoPreview(selectedBusiness.logo || null);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Business Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Business Name</Label>
            <Input
              id="name"
              name="name"
              value={business.name}
              onChange={handleChange}
              placeholder="Your Business Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Business Logo</Label>
            <div className="flex items-start space-x-4">
              <Input
                id="logo"
                name="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="flex-1"
              />
              {logoPreview && (
                <div className="flex-shrink-0">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="h-16 w-auto object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              value={business.email}
              onChange={handleChange}
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={business.phone}
              onChange={handleChange}
              placeholder="(123) 456-7890"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              name="address"
              value={business.address}
              onChange={handleChange}
              placeholder="123 Business St"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={business.city}
              onChange={handleChange}
              placeholder="City"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={business.state}
                onChange={handleChange}
                placeholder="State"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">Zip Code</Label>
              <Input
                id="zip"
                name="zip"
                value={business.zip}
                onChange={handleChange}
                placeholder="Zip"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <div className="flex space-x-2">
            <select 
              className="px-4 py-2 border rounded-md text-sm bg-white"
              onChange={(e) => {
                const selectedIndex = parseInt(e.target.value);
                if (selectedIndex >= 0) {
                  loadBusiness(savedBusinesses[selectedIndex]);
                }
              }}
            >
              <option value="-1">Load saved business</option>
              {savedBusinesses.map((b, index) => (
                <option key={index} value={index}>{b.name}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-invoice-blue text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
            onClick={saveBusiness}
          >
            Save Business
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
