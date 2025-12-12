/*
  BEGINNER NOTE: This page manages emergency shelters - 
  listing, adding, editing, and deleting shelter locations.
*/

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Users, MapPin, Phone } from "lucide-react";
import { fetchShelters, createShelter, updateShelter, deleteShelter } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import type { Shelter, ShelterInput } from "@/types/database";
import { cn } from "@/lib/utils";

export default function SheltersPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShelter, setEditingShelter] = useState<Shelter | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<ShelterInput>({
    name: "",
    address: "",
    capacity: 0,
    current_occupancy: 0,
    contact_info: "",
    is_active: true,
  });

  // Fetch shelters
  const { data: shelters = [], isLoading, refetch } = useQuery({
    queryKey: ["shelters"],
    queryFn: () => fetchShelters(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createShelter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shelters"] });
      toast({ title: "Shelter created", description: "New shelter has been added." });
      closeForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create shelter",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ShelterInput> }) =>
      updateShelter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shelters"] });
      toast({ title: "Shelter updated", description: "Changes have been saved." });
      closeForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update shelter",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteShelter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shelters"] });
      toast({ title: "Shelter deleted", description: "The shelter has been removed." });
      setDeleteId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete shelter",
        variant: "destructive",
      });
    },
  });

  const openNewForm = () => {
    setFormData({
      name: "",
      address: "",
      capacity: 0,
      current_occupancy: 0,
      contact_info: "",
      is_active: true,
    });
    setEditingShelter(null);
    setIsFormOpen(true);
  };

  const openEditForm = (shelter: Shelter) => {
    setFormData({
      name: shelter.name,
      address: shelter.address,
      capacity: shelter.capacity,
      current_occupancy: shelter.current_occupancy,
      contact_info: shelter.contact_info || "",
      lat: shelter.lat || undefined,
      lng: shelter.lng || undefined,
      is_active: shelter.is_active,
    });
    setEditingShelter(shelter);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingShelter(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShelter) {
      updateMutation.mutate({ id: editingShelter.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getOccupancyPercentage = (shelter: Shelter) => {
    if (shelter.capacity === 0) return 0;
    return Math.round((shelter.current_occupancy / shelter.capacity) * 100);
  };

  return (
    <MainLayout>
      <Header onRefresh={() => refetch()} isLoading={isLoading} />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">
              Manage emergency shelter locations and capacity
            </p>
          </div>
          <Button onClick={openNewForm}>
            <Plus className="mr-2 h-4 w-4" />
            Add Shelter
          </Button>
        </div>

        {/* Shelters Grid */}
        {isLoading ? (
          <div className="text-center py-12">Loading shelters...</div>
        ) : shelters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No shelters found.</p>
            <Button onClick={openNewForm}>Add First Shelter</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shelters.map((shelter: Shelter) => {
              const occupancy = getOccupancyPercentage(shelter);
              return (
                <div
                  key={shelter.id}
                  className={cn(
                    "rounded-xl border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover",
                    !shelter.is_active && "opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{shelter.name}</h3>
                      <Badge
                        variant="outline"
                        className={cn(
                          "mt-1",
                          shelter.is_active
                            ? "bg-success/10 text-success border-success/30"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {shelter.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(shelter)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(shelter.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{shelter.address}</span>
                    </div>

                    {shelter.contact_info && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{shelter.contact_info}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {shelter.current_occupancy} / {shelter.capacity}
                      </span>
                      <span className="text-muted-foreground">({occupancy}% full)</span>
                    </div>

                    {/* Capacity bar */}
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all",
                          occupancy >= 90
                            ? "bg-destructive"
                            : occupancy >= 70
                            ? "bg-warning"
                            : "bg-success"
                        )}
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingShelter ? "Edit Shelter" : "Add New Shelter"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="0"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupancy">Current Occupancy</Label>
                <Input
                  id="occupancy"
                  type="number"
                  min="0"
                  value={formData.current_occupancy || 0}
                  onChange={(e) => setFormData({ ...formData, current_occupancy: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Info</Label>
              <Input
                id="contact"
                value={formData.contact_info || ""}
                onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                placeholder="Phone number"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active</Label>
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingShelter ? "Save Changes" : "Add Shelter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shelter?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the shelter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
