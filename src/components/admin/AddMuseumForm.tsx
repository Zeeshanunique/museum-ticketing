"use client";

import { useState } from "react";
import { addMuseumData } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Plus, Trash } from "lucide-react";

interface FacilityInput {
  id: string;
  value: string;
}

interface TicketTypeInput {
  id: string;
  name: string;
  price: string;
  description: string;
}

export default function AddMuseumForm() {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    location: {
      address: "",
      city: "",
      state: "",
      pincode: ""
    },
    timings: {
      opening: "",
      closing: "",
      holidays: [""]
    }
  });
  
  const [facilities, setFacilities] = useState<FacilityInput[]>([
    { id: "1", value: "" }
  ]);
  
  const [ticketTypes, setTicketTypes] = useState<TicketTypeInput[]>([
    { id: "1", name: "", price: "", description: "" }
  ]);
  
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleFacilityChange = (id: string, value: string) => {
    setFacilities(prev => 
      prev.map(facility => 
        facility.id === id ? { ...facility, value } : facility
      )
    );
  };
  
  const addFacility = () => {
    setFacilities(prev => [
      ...prev, 
      { id: String(Date.now()), value: "" }
    ]);
  };
  
  const removeFacility = (id: string) => {
    if (facilities.length > 1) {
      setFacilities(prev => prev.filter(facility => facility.id !== id));
    }
  };
  
  const handleTicketTypeChange = (id: string, field: keyof TicketTypeInput, value: string) => {
    setTicketTypes(prev => 
      prev.map(ticket => 
        ticket.id === id ? { ...ticket, [field]: value } : ticket
      )
    );
  };
  
  const addTicketType = () => {
    setTicketTypes(prev => [
      ...prev, 
      { id: String(Date.now()), name: "", price: "", description: "" }
    ]);
  };
  
  const removeTicketType = (id: string) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(prev => prev.filter(ticket => ticket.id !== id));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    
    try {
      // Validate form
      if (!formData.id || !formData.name || !formData.description) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }
      
      // Prepare museum data
      const museumData = {
        ...formData,
        facilities: facilities.map(f => f.value).filter(Boolean),
        tickets: ticketTypes.reduce((acc, ticket) => {
          if (ticket.name && ticket.price) {
            const key = ticket.name.toLowerCase().replace(/\s+/g, '_');
            acc[key] = {
              name: ticket.name,
              price: parseFloat(ticket.price),
              description: ticket.description
            };
          }
          return acc;
        }, {} as Record<string, { name: string; price: number; description: string }>),
        shows: []
      };
      
      const result = await addMuseumData(museumData);
      
      if (result.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          id: "",
          name: "",
          description: "",
          location: {
            address: "",
            city: "",
            state: "",
            pincode: ""
          },
          timings: {
            opening: "",
            closing: "",
            holidays: [""]
          }
        });
        setFacilities([{ id: "1", value: "" }]);
        setTicketTypes([{ id: "1", name: "", price: "", description: "" }]);
      } else {
        setError("Failed to add museum. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Museum</CardTitle>
        <CardDescription>
          Enter the details to add a new museum to the database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id">Museum ID (unique)</Label>
                <Input
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  placeholder="e.g., nationalmuseum"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier for the museum (no spaces)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Museum Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., National Museum of History"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter a description of the museum"
                rows={3}
                required
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Location</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location.address">Address</Label>
                <Input
                  id="location.address"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location.city">City</Label>
                <Input
                  id="location.city"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location.state">State</Label>
                <Input
                  id="location.state"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location.pincode">PIN Code</Label>
                <Input
                  id="location.pincode"
                  name="location.pincode"
                  value={formData.location.pincode}
                  onChange={handleInputChange}
                  placeholder="PIN Code"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Timings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timings.opening">Opening Time</Label>
                <Input
                  id="timings.opening"
                  name="timings.opening"
                  value={formData.timings.opening}
                  onChange={handleInputChange}
                  placeholder="e.g., 9:00 AM"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timings.closing">Closing Time</Label>
                <Input
                  id="timings.closing"
                  name="timings.closing"
                  value={formData.timings.closing}
                  onChange={handleInputChange}
                  placeholder="e.g., 5:00 PM"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Facilities</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addFacility}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Facility</span>
              </Button>
            </div>
            
            {facilities.map((facility, index) => (
              <div key={facility.id} className="flex items-center gap-2">
                <Input
                  value={facility.value}
                  onChange={(e) => handleFacilityChange(facility.id, e.target.value)}
                  placeholder={`Facility ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFacility(facility.id)}
                  disabled={facilities.length === 1}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Ticket Types</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addTicketType}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Ticket Type</span>
              </Button>
            </div>
            
            {ticketTypes.map((ticket, index) => (
              <div key={ticket.id} className="space-y-4 border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Ticket Type {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTicketType(ticket.id)}
                    disabled={ticketTypes.length === 1}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`ticket-name-${ticket.id}`}>Name</Label>
                    <Input
                      id={`ticket-name-${ticket.id}`}
                      value={ticket.name}
                      onChange={(e) => handleTicketTypeChange(ticket.id, 'name', e.target.value)}
                      placeholder="e.g., Adult Entry"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`ticket-price-${ticket.id}`}>Price</Label>
                    <Input
                      id={`ticket-price-${ticket.id}`}
                      type="number"
                      value={ticket.price}
                      onChange={(e) => handleTicketTypeChange(ticket.id, 'price', e.target.value)}
                      placeholder="e.g., 100"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`ticket-desc-${ticket.id}`}>Description</Label>
                  <Input
                    id={`ticket-desc-${ticket.id}`}
                    value={ticket.description}
                    onChange={(e) => handleTicketTypeChange(ticket.id, 'description', e.target.value)}
                    placeholder="e.g., Standard entry for adults"
                  />
                </div>
              </div>
            ))}
          </div>
          
          {success && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle className="h-5 w-5" />
              <span>Museum added successfully!</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding Museum..." : "Add Museum"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 