'use client'

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useGetDoctorSlots } from "@/queries/doctorSlots/get-doctorSlots";
import { updateDoctorSlots } from "@/queries/doctorSlots/update-doctorSlots";
import { createDoctorSlots } from "@/queries/doctorSlots/create-doctorSlots";
import { useGetUserById } from "@/queries/users/get-user-by-id";
import { User } from "@/queries/users/get-users";
import { Loader2, Plus } from "lucide-react";
import { DoctorSlot } from "@/queries/doctorSlots/get-doctorSlots";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUpdateUserSlots } from "@/queries/users/update-user-slots";

interface DoctorSlotsProps {
  doctorId: string;
}

interface UserDoctorSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  doctorSlots: UserDoctorSlot[];
  // ... other user fields
}

const daysOfWeek = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" }
];

export default function DoctorSlotsManager({ doctorId }: DoctorSlotsProps) {
  const [activeTab, setActiveTab] = useState("monday");
  const [slotsByDay, setSlotsByDay] = useState<Record<string, DoctorSlot[]>>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  });
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({ startTime: "09:00", endTime: "10:00" });
  
  // Fetch all slots and user data
  const { data: slots, isLoading: isSlotsLoading, refetch: refetchSlots } = useGetDoctorSlots();
  const { data: userData, isLoading: isUserLoading, refetch: refetchUser } = useGetUserById(doctorId);

  // Process user doctor slots when data changes
  useEffect(() => {
    if (userData) {
      // Extract slot IDs from doctor slots (which could be either array of IDs or array of objects)
      if (userData.doctorSlots) {
        if (Array.isArray(userData.doctorSlots)) {
          if (userData.doctorSlots.length > 0) {
            // Check if doctorSlots is array of objects or array of IDs
            if (typeof userData.doctorSlots[0] === 'string') {
              // It's already an array of IDs
              setSelectedSlotIds(userData.doctorSlots);
            } else if (typeof userData.doctorSlots[0] === 'object') {
              // It's an array of slot objects
              const slotIds = userData.doctorSlots.map((slot: any) => slot.id);
              setSelectedSlotIds(slotIds);
            }
          } else {
            setSelectedSlotIds([]);
          }
        } else {
          setSelectedSlotIds([]);
        }
      } else {
        setSelectedSlotIds([]);
      }
    }
  }, [userData]);

  // Process slots on data load
  useEffect(() => {
    if (slots) {
      // Organize slots by day
      const sortedSlotsByDay: Record<string, DoctorSlot[]> = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      };
      
      // Organize all slots by day
      slots.forEach(slot => {
        const day = slot.day.toLowerCase();
        if (sortedSlotsByDay[day]) {
          sortedSlotsByDay[day].push(slot);
        }
      });
      
      // Sort slots for each day by start time
      Object.keys(sortedSlotsByDay).forEach(day => {
        sortedSlotsByDay[day].sort((a, b) => {
          return a.startTime.localeCompare(b.startTime);
        });
      });
      
      setSlotsByDay(sortedSlotsByDay);
    }
  }, [slots]);

  const formatTime = (time: string): string => {
    // Handle the exact format seen in the response (like "10:00:00")
    if (time && time.length === 8 && time.includes(':00:00')) {
      return time.substring(0, 5); // Return "10:00" from "10:00:00"
    } else if (time && time.length === 8 && time.includes(':30:00')) {
      return time.substring(0, 5); // Return "10:30" from "10:30:00"
    } else if (time && time.length === 8) {
      return time.substring(0, 5); // Generic case for HH:MM:SS format
    }
    return time || '';
  };

  const handleAddSlot = () => {
    setIsAddingSlot(true);
  };

  const handleCreateSlot = async () => {
    try {
      await createDoctorSlots({
        day: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
        startTime: newSlot.startTime + ':00',
        endTime: newSlot.endTime + ':00',
      });
      
      setIsAddingSlot(false);
      // Refresh both slots and user data
      await refetchSlots();
      await refetchUser();
      
      toast({
        title: "Success",
        description: "New time slot added successfully",
      });
    } catch (error) {
      console.error("Error adding time slot:", error);
      toast({
        title: "Error",
        description: "Failed to add time slot",
        variant: "destructive",
      });
    }
  };

  const handleSlotClick = (slot: DoctorSlot) => {
    setSelectedSlotIds(prev => {
      const isSelected = prev.includes(slot.id);
      
      if (isSelected) {
        return prev.filter(id => id !== slot.id);
      } else {
        return [...prev, slot.id];
      }
    });
  };

  const updateSlots = useUpdateUserSlots();

  const handleSave = async () => {
    setIsUpdating(true);
    
    try {
      // Update user slots using the dedicated endpoint
      await updateSlots.mutateAsync({
        userId: doctorId,
        slotIds: selectedSlotIds
      });
      
      toast({
        title: "Success",
        description: "Doctor schedule updated successfully",
      });
      
      // Refresh user data to get updated slots
      await refetchUser();
      
    } catch (error) {
      console.error("Error updating doctor schedule:", error);
      toast({
        title: "Error",
        description: "Failed to update doctor schedule",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const isSlotSelected = (slotId: string): boolean => {
    return selectedSlotIds.includes(slotId);
  };

  if (isSlotsLoading || isUserLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading schedule...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <p className="text-muted-foreground">Manage available time slots for each day of the week</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-4 grid grid-cols-7">
            {daysOfWeek.map(day => (
              <TabsTrigger key={day.id} value={day.id} className="text-xs sm:text-sm">
                {day.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {daysOfWeek.map(day => (
            <TabsContent key={day.id} value={day.id} className="pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">{day.label} Slots</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddSlot}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Time Slot
                </Button>
              </div>
              
              {slotsByDay[day.id].length === 0 ? (
                <p className="text-sm text-muted-foreground">No time slots scheduled for {day.label}. Add your first slot.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {slotsByDay[day.id].map((slot) => {
                    const isSelected = isSlotSelected(slot.id);
                    
                    return (
                      <Button
                        key={slot.id}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => handleSlotClick(slot)}
                        className="text-sm h-10"
                      >
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </Button>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={isUpdating}
            className="min-w-[100px]"
          >
            {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {isUpdating ? "Updating..." : "Update Schedule"}
          </Button>
        </div>

        <Dialog open={isAddingSlot} onOpenChange={setIsAddingSlot}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Time Slot</DialogTitle>
              <DialogDescription>
                Add a new time slot for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time</label>
                <Input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">End Time</label>
                <Input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingSlot(false)}>Cancel</Button>
              <Button onClick={handleCreateSlot}>Add Slot</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
} 