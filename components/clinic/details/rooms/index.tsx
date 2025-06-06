'use client'
import React, { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash2 } from "lucide-react";
import withAuth from "@/utils/privateRouter";
import { useDeleteRoom } from "@/queries/rooms/delete-room";
import { toast } from "@/components/ui/use-toast";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import NewRoom from "./newRoom";
import RoomDetails from "./roomDetails";
import { useGetRoom } from "@/queries/rooms/get-room";

// Room type based on API response
export type Room = {
  id: string;
  clinicId: string;
  name: string;
  roomType: string | null;
  isActive: boolean;
};

type RoomFormValues = Omit<Room, "id" | "createdAt" | "updatedAt">;

type RoomProps = {
  clinicId?: string;
};

function Room({ clinicId }: RoomProps) {
  const { data: result, isLoading, isError } = useGetRoom(1, 10, '', clinicId || '');
  const [openNew, setOpenNew] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteRoom = useDeleteRoom({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      });
    }
  });

  const handleEditRoomClick = (roomId: string) => {
    setSelectedRoomId(roomId);
    setOpenDetails(true);
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteRoom.mutateAsync(roomToDelete.id);
    } catch (error) {
      // Handle error
    } finally {
      setIsDeleting(false);
      setRoomToDelete(null);
    }
  };

  const openDeleteDialog = (room: Room) => {
    setRoomToDelete(room);
    setIsDeleteDialogOpen(true);
  };

  const columns: ColumnDef<Room>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "roomType", header: "Room Type" },
    { accessorKey: "isActive", header: "Active", cell: ({ getValue }) => getValue() ? "Yes" : "No" },
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
              handleEditRoomClick(row.original.id);
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <Sheet open={openNew} onOpenChange={setOpenNew}>
          <SheetTrigger asChild>
            <Button onClick={() => setOpenNew(true)}><Plus className="mr-2 h-4 w-4" />Add Room</Button>
          </SheetTrigger>
          <SheetContent side="right" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>New Room</SheetTitle>
            </SheetHeader>
            <NewRoom clinicId={clinicId} onSuccess={() => { setOpenNew(false); }} />
          </SheetContent>
        </Sheet>
      </div>
      <DataTable
        columns={columns}
        data={result?.items ?? []}
        searchColumn="name"
        searchPlaceholder="Search rooms..."
        page={result?.pageNumber ?? 1}
        pageSize={result?.pageSize ?? 10}
        totalPages={result?.totalPages ?? 1}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
      />

      <Sheet open={openDetails} onOpenChange={setOpenDetails}>
        <SheetContent side="right" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Room Details</SheetTitle>
          </SheetHeader>
          {selectedRoomId && (
            <RoomDetails 
              roomId={selectedRoomId}
              clinicId={clinicId || ''}
              onSuccess={() => setOpenDetails(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteRoom}
        title="Delete Room"
        itemName={roomToDelete?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default withAuth(Room);
