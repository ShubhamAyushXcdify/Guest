'use client'

import { ReactNode } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { Button } from "./button"

interface DeleteConfirmationDialogProps {
  title?: string
  description?: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void> | void
  trigger?: ReactNode
  itemName?: string
  isDeleting?: boolean
}

export function DeleteConfirmationDialog({
  title = "Delete Confirmation",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  isOpen,
  onOpenChange,
  onConfirm,
  trigger,
  itemName,
  isDeleting = false,
}: DeleteConfirmationDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && trigger}
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            <span>{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="py-3">
            {itemName ? (
              <>
                Are you sure you want to delete <span className="font-medium text-foreground">{itemName}</span>? 
                This action cannot be undone.
              </>
            ) : (
              description
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            asChild
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
          >
            <Button className="bg-[#1E3D3D] text-white hover:bg-[#1E3D3D] hover:text-white" disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 