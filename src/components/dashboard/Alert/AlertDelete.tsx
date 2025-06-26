import React from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { X } from 'lucide-react';
import { cn } from "../../../lib/utils";

interface AlertDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isDeleting?: boolean; // Add optional loading state
  type?: 'project' | 'report'; // Add type to customize content
}

// Özel DialogContent bileşeni - X butonu olmayan versiyon
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Content
    ref={ref}
    className={cn(
      "fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-[2rem]",
      className
    )}
    {...props}
  >
    {children}
  </DialogPrimitive.Content>
));

/**
 * Custom delete confirmation dialog component
 * @param isOpen - Controls visibility of the dialog
 * @param onClose - Function to call when canceling/closing the dialog
 * @param onConfirm - Function to call when confirming deletion
 * @param title - Title/name of the item being deleted
 * @param type - Type of item being deleted (project or report)
 */
const AlertDelete: React.FC<AlertDeleteProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  isDeleting = false,
  type = 'project',
}) => {
  const getContent = () => {
    if (type === 'report') {
      return {
        description: `Are you sure you want to delete "${title}"?`,
        details: "This will permanently remove the test report file from the system.",
        items: [
          "HTML report file",
          "Test execution data",
          "Screenshots and attachments (if any)"
        ]
      };
    } else {
      return {
        description: `Are you sure you want to delete "${title}"?`,
        details: "This will permanently remove the project and all associated data including:",
        items: [
          "All Excel files and sheets",
          "Product backlog items and test cases", 
          "Test runs and results",
          "Screenshots and attachments"
        ]
      };
    }
  };

  const content = getContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay />
        <CustomDialogContent className="sm:max-w-[560px] p-0 gap-0 border-none bg-white overflow-hidden">
          <div className="p-6 w-full relative">            
            <button 
              onClick={onClose}
              className="absolute right-6 top-6 rounded-full p-1.5 hover:bg-gray-100 border border-[#e0e0e0]"
              title="Close dialog"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5 text-[#969696]" strokeWidth={2.5} />
            </button>
            
            <DialogHeader className="pb-4">
              <DialogTitle className="text-left text-3xl font-medium text-[#3c3c3c]">
                Confirm delete
              </DialogTitle>
            </DialogHeader>              
            
            <div className="py-2">
              <p className="text-left text-base text-gray-700">
                {content.description}
              </p>              
              
              <p className="text-left text-base text-gray-700 mt-2">
                {content.details}
              </p>
              
              {content.items.length > 0 && (
                <ul className="text-left text-sm text-gray-700 mt-2 ml-4 list-disc">
                  {content.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
              
              <p className="text-left text-base text-red-600 mt-2 font-medium">
                This action cannot be undone.
              </p>
            </div>
          </div>          
          
          <div className="flex flex-row gap-3 p-6 pt-0">
            <Button 
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-6 py-2 rounded-3xl bg-[#f44336] hover:bg-[#d32f2f] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </div>
              ) : (
                'Yes, delete it'
              )}
            </Button>
            <Button 
              variant="ghost" 
              onClick={onClose}
              disabled={isDeleting}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              No, keep it
            </Button>
          </div>
        </CustomDialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default AlertDelete;
