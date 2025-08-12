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
import { XIcon } from "lucide-react"
import { Button } from "./button"

interface CancelConfirmationDialogProps {
  title?: string
  description?: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void> | void
  trigger?: ReactNode
  appointmentInfo?: string
  isCancelling?: boolean
}

export function CancelConfirmationDialog({
  title = "Cancel Appointment",
  description = "Are you sure you want to cancel this appointment? This action cannot be undone.",
  isOpen,
  onOpenChange,
  onConfirm,
  trigger,
  appointmentInfo,
  isCancelling = false,
}: CancelConfirmationDialogProps) {
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
            <XIcon className="h-5 w-5" />
            <span>{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="py-3">
            {appointmentInfo ? (
              <>
                Are you sure you want to cancel the appointment for <span className="font-medium text-foreground">{appointmentInfo}</span>? 
                This action cannot be undone.
              </>
            ) : (
              description
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isCancelling}>Keep Appointment</AlertDialogCancel>
          <AlertDialogAction
            asChild
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
          >
            <Button variant="destructive" disabled={isCancelling}>
              {isCancelling ? "Cancelling..." : "Cancel Appointment"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}