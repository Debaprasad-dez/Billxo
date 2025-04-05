
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Search, UserPlus, Edit2, Trash2 } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Client } from '@/types/invoice';
import { v4 as uuidv4 } from 'uuid';

const ClientsPage = () => {
  const [clients, setClients] = useLocalStorage<Client[]>('clients', []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentClient, setCurrentClient] = useState<Client>({
    id: '',
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentClient(prev => ({ ...prev, [name]: value }));
  };

  const handleAddClient = () => {
    if (!currentClient.name) {
      toast({
        title: "Required Field Missing",
        description: "Client name is required.",
        variant: "destructive",
      });
      return;
    }

    if (isEditing) {
      // Update existing client
      setClients(clients.map(client => 
        client.id === currentClient.id ? currentClient : client
      ));
      toast({
        title: "Client Updated",
        description: `${currentClient.name} has been updated.`,
      });
    } else {
      // Add new client with a new ID
      const newClient = { ...currentClient, id: uuidv4() };
      setClients([...clients, newClient]);
      toast({
        title: "Client Added",
        description: `${newClient.name} has been added to your clients.`,
      });
    }

    // Reset form and close dialog
    resetForm();
  };

  const handleEditClient = (client: Client) => {
    setCurrentClient(client);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteClient = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete client "${name}"?`)) {
      setClients(clients.filter(client => client.id !== id));
      toast({
        title: "Client Deleted",
        description: `${name} has been removed from your clients.`,
      });
    }
  };

  const resetForm = () => {
    setCurrentClient({
      id: '',
      name: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
    });
    setIsEditing(false);
    setIsDialogOpen(false);
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setIsEditing(false);
                setCurrentClient({
                  id: '',
                  name: '',
                  email: '',
                  address: '',
                  city: '',
                  state: '',
                  zip: '',
                  phone: '',
                });
              }}>
                <UserPlus className="h-4 w-4 mr-1" /> Add Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit Client' : 'Add New Client'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={currentClient.name}
                      onChange={handleInputChange}
                      placeholder="Client Name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={currentClient.email}
                      onChange={handleInputChange}
                      placeholder="client@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={currentClient.address}
                    onChange={handleInputChange}
                    placeholder="Street Address"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={currentClient.city}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={currentClient.state}
                      onChange={handleInputChange}
                      placeholder="State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">Zip Code</Label>
                    <Input
                      id="zip"
                      name="zip"
                      value={currentClient.zip}
                      onChange={handleInputChange}
                      placeholder="Zip Code"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={currentClient.phone}
                    onChange={handleInputChange}
                    placeholder="(123) 456-7890"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleAddClient}>
                  {isEditing ? 'Save Changes' : 'Add Client'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Client Directory</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredClients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{client.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{client.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{client.phone}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {[client.city, client.state].filter(Boolean).join(', ')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClient(client)}
                              className="text-gray-600 hover:text-blue-600"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClient(client.id, client.name)}
                              className="text-gray-600 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Clients Found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {clients.length === 0
                    ? "Get started by creating a new client."
                    : "No clients match your search criteria."}
                </p>
                {clients.length === 0 && (
                  <div className="mt-6">
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-1" /> Add Client
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ClientsPage;
