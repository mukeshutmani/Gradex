"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, Trash2, X } from "lucide-react"

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
  loading?: boolean
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm()
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <Trash2 className="h-6 w-6 text-red-600" />,
          iconBg: "bg-red-100",
          confirmButton: "bg-red-600 hover:bg-red-700 text-white",
          titleColor: "text-red-900"
        }
      case "warning":
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
          iconBg: "bg-yellow-100",
          confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white",
          titleColor: "text-yellow-900"
        }
      case "info":
        return {
          icon: <AlertTriangle className="h-6 w-6 text-blue-600" />,
          iconBg: "bg-blue-100",
          confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
          titleColor: "text-blue-900"
        }
      default:
        return {
          icon: <Trash2 className="h-6 w-6 text-red-600" />,
          iconBg: "bg-red-100",
          confirmButton: "bg-red-600 hover:bg-red-700 text-white",
          titleColor: "text-red-900"
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center`}>
              {styles.icon}
            </div>
            <div className="flex-1">
              <DialogTitle className={`text-lg font-semibold ${styles.titleColor}`}>
                {title}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-gray-600 text-left pl-16">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end space-x-3 mt-6 pl-16">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="min-w-[80px]"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`min-w-[100px] ${styles.confirmButton}`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Please wait...</span>
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}