'use client'
import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash2, ArrowLeft } from "lucide-react";
import withAuth from "@/utils/privateRouter";
import { useDeleteSlot } from "@/queries/slots/delete-slot";
import { toast } from "@/components/ui/use-toast";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import NewSlots from "./newSlots";
import SlotDetails from "./slotDetails";
import { useGetSlotByRoomId, Slot } from "@/queries/slots/get-slot-by-roomId";
import { useRouter } from "next/navigation";
import { useGetRoomById } from "@/queries/rooms/get-room-by-id";

type SlotProps = {
  roomId: string;
  clinicId?: string;
};

function Slots({ roomId, clinicId }: SlotProps) {
  const router = useRouter();
  const { data: result, isLoading, isError, refetch } = useGetSlotByRoomId(1, 10, '', roomId);
  const { data: room } = useGetRoomById(roomId);
  const [openNew, setOpenNew] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<Slot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteSlot = useDeleteSlot({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Slot deleted successfully",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete slot",
        variant: "destructive",
      });
    }
  });

  const handleEditSlotClick = (slotId: string) => {
    setSelectedSlotId(slotId);
    setOpenDetails(true);
  };

  const handleDeleteSlot = async () => {
    if (!slotToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteSlot.mutateAsync(slotToDelete.id);
    } catch (error) {
      // Error handled in onError callback
    } finally {
      setIsDeleting(false);
      setSlotToDelete(null);
    }
  };

  const openDeleteDialog = (slot: Slot) => {
    setSlotToDelete(slot);
    setIsDeleteDialogOpen(true);
  };

  // Format time for display (assuming HH:mm:ss format from API)
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    // If time is already in HH:MM format, return as is
    if (timeString.length <= 5) return timeString;
    
    // Otherwise, try to parse and format
    try {
      return timeString.split('T')[1]?.substring(0, 5) || timeString;
    } catch (e) {
      return timeString;
    }
  };

  const handleBackClick = () => {
    if (clinicId) {
      router.push(`/clinic/${clinicId}/rooms`);
    } else {
      router.back();
    }
  };

  const columns: ColumnDef<Slot>[] = [
    { 
      accessorKey: "startTime", 
      header: "Start Time",
      cell: ({ row }) => formatTime(row.getValue("startTime"))
    },
    { 
      accessorKey: "endTime", 
      header: "End Time",
      cell: ({ row }) => formatTime(row.getValue("endTime"))
    },
    { 
      accessorKey: "durationMinutes", 
      header: "Duration (min)"
    },
    { 
      accessorKey: "isActive", 
      header: "Active", 
      cell: ({ getValue }) => getValue() ? "Yes" : "No" 
    },
    {
      accessorKey: "isAvailable",
      header: "Available",
      cell: ({ row }) => (row.original.isAvailable ? 'Yes' : 'No'),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex gap-2 justify-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              handleEditSlotClick(row.original.id);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-red-500 hover:text-red-700 hover:bg-red-100"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteDialog(row.original);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      meta: { className: "text-center" },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={handleBackClick} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Rooms
        </Button>
      </div>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Slots {room?.name ? `for ${room.name}` : ''}
        </h1>
        <Sheet open={openNew} onOpenChange={setOpenNew}>
          <SheetTrigger asChild>
            <Button onClick={() => setOpenNew(true)}><Plus className="mr-2 h-4 w-4" />Add Slot</Button>
          </SheetTrigger>
          <SheetContent side="right" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>New Slot</SheetTitle>
            </SheetHeader>
            <NewSlots roomId={roomId} clinicId={clinicId} onSuccess={() => { setOpenNew(false); refetch(); }} />
          </SheetContent>
        </Sheet>
      </div>
      <DataTable
        columns={columns}
        data={result?.items ?? []}
        searchColumn="startTime"
        searchPlaceholder="Search slots..."
        page={result?.pageNumber ?? 1}
        pageSize={result?.pageSize ?? 10}
        totalPages={result?.totalPages ?? 1}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
      />

      <Sheet open={openDetails} onOpenChange={setOpenDetails}>
        <SheetContent side="right" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Slot Details</SheetTitle>
          </SheetHeader>
          {selectedSlotId && (
            <SlotDetails 
              slotId={selectedSlotId}
              roomId={roomId}
              clinicId={clinicId}
              onSuccess={() => { setOpenDetails(false); refetch(); }}
            />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteSlot}
        title="Delete Slot"
        description="Are you sure you want to delete this slot? This action cannot be undone."
        itemName={`${formatTime(slotToDelete?.startTime || '')} - ${formatTime(slotToDelete?.endTime || '')}`}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default withAuth(Slots);
