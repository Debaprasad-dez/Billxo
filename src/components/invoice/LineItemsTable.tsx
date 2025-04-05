
import React, { useState } from 'react';
import { LineItem } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { v4 as uuidv4 } from 'uuid';
import { X, Plus } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';

interface LineItemsTableProps {
  lineItems: LineItem[];
  currency: string;
  onUpdate: (lineItems: LineItem[]) => void;
}

export const LineItemsTable = ({ lineItems, currency, onUpdate }: LineItemsTableProps) => {
  const [newItems, setNewItems] = useState<LineItem[]>(lineItems || []);
  
  const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedItems = [...newItems];
    
    if (field === 'quantity' || field === 'unitPrice' || field === 'tax') {
      updatedItems[index][field] = Number(value) || 0;
    } else {
      // @ts-ignore - TypeScript doesn't know that description is a string
      updatedItems[index][field] = value;
    }
    
    // Recalculate the total for this line item
    const quantity = updatedItems[index].quantity;
    const unitPrice = updatedItems[index].unitPrice;
    const tax = updatedItems[index].tax;
    
    const subtotal = quantity * unitPrice;
    const taxAmount = subtotal * (tax / 100);
    updatedItems[index].total = subtotal + taxAmount;
    
    setNewItems(updatedItems);
    onUpdate(updatedItems);
  };
  
  const handleAddItem = () => {
    const newItem: LineItem = {
      id: uuidv4(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      tax: 0,
      total: 0
    };
    
    const updatedItems = [...newItems, newItem];
    setNewItems(updatedItems);
    onUpdate(updatedItems);
  };
  
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...newItems];
    updatedItems.splice(index, 1);
    setNewItems(updatedItems);
    onUpdate(updatedItems);
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Line Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="border-b">
              <tr className="text-left">
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2 w-24">Quantity</th>
                <th className="px-4 py-2 w-32">Unit Price</th>
                <th className="px-4 py-2 w-24">Tax</th>
                <th className="px-4 py-2 w-32">Total</th>
                <th className="px-4 py-2 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {newItems.map((item, index) => (
                <tr key={item.id} className="border-b">
                  <td className="px-4 py-2">
                    <Input 
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Item description"
                      className="w-full"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Input 
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-full"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Input 
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      className="w-full"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="tax-input-container">
                      <Input 
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={item.tax}
                        onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
                        className="w-full"
                      />
                      <span className="tax-percent-symbol">%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      {formatCurrency(item.total, currency)}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      disabled={newItems.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <Button 
          type="button"
          variant="outline" 
          className="mt-4"
          onClick={handleAddItem}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </CardContent>
    </Card>
  );
};
