
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/utils/helpers';

interface InvoiceSummaryProps {
  subTotal: number;
  taxTotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  grandTotal: number;
  currency: string;
  onUpdateDiscount: (discount: number) => void;
  onUpdateDiscountType: (type: 'percentage' | 'fixed') => void;
  onUpdateCurrency: (currency: string) => void;
}

export const InvoiceSummary = ({
  subTotal,
  taxTotal,
  discount,
  discountType,
  grandTotal,
  currency,
  onUpdateDiscount,
  onUpdateDiscountType,
  onUpdateCurrency,
}: InvoiceSummaryProps) => {
  const currencies = [
    { value: '$', label: 'USD ($)' },
    { value: '€', label: 'EUR (€)' },
    { value: '£', label: 'GBP (£)' },
    { value: '¥', label: 'JPY (¥)' },
    { value: '₹', label: 'INR (₹)' },
    { value: '₩', label: 'KRW (₩)' },
    { value: 'CA$', label: 'CAD (CA$)' },
    { value: 'A$', label: 'AUD (A$)' },
  ];

  const discountValue = discountType === 'percentage'
    ? `${discount}%`
    : formatCurrency(discount, currency);
  
  const discountAmount = discountType === 'percentage'
    ? (subTotal * (discount / 100))
    : discount;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Invoice Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={onUpdateCurrency}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <Select 
                value={discountType} 
                onValueChange={(value: 'percentage' | 'fixed') => onUpdateDiscountType(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="discount">Discount {discountType === 'percentage' ? '(%)' : ''}</Label>
            <div className="relative">
              {discountType === 'fixed' && (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  {currency}
                </span>
              )}
              <Input
                id="discount"
                type="number"
                min="0"
                value={discount}
                onChange={(e) => onUpdateDiscount(parseFloat(e.target.value) || 0)}
                className={discountType === 'fixed' ? "pl-7" : ""}
              />
              {discountType === 'percentage' && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                  %
                </span>
              )}
            </div>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(subTotal, currency)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Tax:</span>
              <span className="font-medium">{formatCurrency(taxTotal, currency)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Discount:</span>
              <span className="font-medium">-{formatCurrency(discountAmount, currency)}</span>
            </div>
            <div className="flex justify-between py-3 border-t border-gray-200 mt-2">
              <span className="text-lg font-semibold">Grand Total:</span>
              <span className="text-lg font-bold text-invoice-blue">{formatCurrency(grandTotal, currency)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
