"use client";

import { Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader>
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-center text-base font-semibold text-slate-800">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-slate-500">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="border-0 bg-transparent -mx-0 -mb-0 mt-2 flex flex-row justify-center gap-3 p-0 rounded-none">
          {/* Cancel */}
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium
              text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors"
          >
            Cancel
          </button>

          {/* Confirm (destructive) */}
          <button
            type="button"
            id="confirm-dialog-confirm-btn"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
              flex items-center justify-center gap-2
              disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
