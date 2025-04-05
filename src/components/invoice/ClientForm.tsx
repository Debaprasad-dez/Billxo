
import { v4 as uuidv4 } from 'uuid';
import { Client } from '@/types/invoice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useLocalStorage from '@/hooks/useLocalStorage';

interface ClientFormProps {
  client: Client;
  onUpdate: (client: Client) => void;
}

export const ClientForm = ({ client, onUpdate }: ClientFormProps) => {
  const [savedClients, setSavedClients] = useLocalStorage<Client[]>('clients', []);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdate({ ...client, [name]: value });
  };

  const handleSaveClient = () => {
    if (!client.name) {
      toast({
        title: "Error",
        description: "Please provide a client name before saving",
        variant: "destructive",
      });
      return;
    }

    // Check if client already exists by name or if this is an existing client
    const existingClientIndex = savedClients.findIndex(c => 
      c.id === client.id || (c.name === client.name && c.email === client.email)
    );
    
    let newClient = client;
    
    // If this is a new client with no ID, generate one
    if (!newClient.id) {
      newClient = { ...newClient, id: uuidv4() };
    }
    
    if (existingClientIndex >= 0) {
      // Update existing client
      const updatedClients = [...savedClients];
      updatedClients[existingClientIndex] = newClient;
      setSavedClients(updatedClients);
      toast({
        title: "Client Updated",
        description: "Client information has been updated",
      });
    } else {
      // Add new client
      setSavedClients([...savedClients, newClient]);
      onUpdate(newClient); // Update the form with the generated ID
      toast({
        title: "Client Saved",
        description: "Client has been saved for future use",
      });
    }
  };

  const handleLoadClient = (selectedClient: Client) => {
    onUpdate(selectedClient);
  };

  const handleDeleteClient = (clientId: string) => {
    const updatedClients = savedClients.filter(c => c.id !== clientId);
    setSavedClients(updatedClients);
    toast({
      title: "Client Deleted",
      description: "Client has been removed from saved list",
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Client Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="client-name">Client Name</Label>
            <Input
              id="client-name"
              name="name"
              value={client.name}
              onChange={handleChange}
              placeholder="Client Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-email">Email</Label>
            <Input
              id="client-email"
              name="email"
              value={client.email}
              onChange={handleChange}
              placeholder="client@example.com"
              type="email"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="client-address">Street Address</Label>
            <Input
              id="client-address"
              name="address"
              value={client.address}
              onChange={handleChange}
              placeholder="123 Client St"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-phone">Phone</Label>
            <Input
              id="client-phone"
              name="phone"
              value={client.phone}
              onChange={handleChange}
              placeholder="(123) 456-7890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-city">City</Label>
            <Input
              id="client-city"
              name="city"
              value={client.city}
              onChange={handleChange}
              placeholder="City"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-state">State</Label>
              <Input
                id="client-state"
                name="state"
                value={client.state}
                onChange={handleChange}
                placeholder="State"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-zip">Zip Code</Label>
              <Input
                id="client-zip"
                name="zip"
                value={client.zip}
                onChange={handleChange}
                placeholder="Zip"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Saved Clients</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSaveClient}
            >
              <Plus className="h-4 w-4 mr-1" /> Save Current Client
            </Button>
          </div>
          
          {savedClients.length > 0 ? (
            <div className="mt-3 border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {savedClients.map((savedClient) => (
                    <tr key={savedClient.id}>
                      <td className="px-4 py-2">{savedClient.name}</td>
                      <td className="px-4 py-2">{savedClient.email}</td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleLoadClient(savedClient)}
                          >
                            Use
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClient(savedClient.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-3">No saved clients yet. Save a client to see it here.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
