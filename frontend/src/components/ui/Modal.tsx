import { type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Modal({ open, onClose, title, description, children, size = "md" }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-full rounded-2xl bg-white shadow-xl dark:bg-slate-800",
            "animate-slide-up",
            sizeClasses[size],
            "focus:outline-none"
          )}
        >
          <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4 dark:border-slate-700">
            <div>
              {title && (
                <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-white">
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              className="ml-4 flex-shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700 dark:text-slate-500"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="px-6 py-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
