'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  itemName?: string;
  loading?: boolean;
  destructive?: boolean;
  confirmText?: string;
  cancelText?: string;
  className?: string;
}

export function DeleteDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title = 'Are you absolutely sure?',
  description,
  itemName,
  loading = false,
  destructive = true,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  className,
}: DeleteDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      // Error handling should be done by the parent component
      console.error('Delete operation failed:', error);
    }
  };

  const defaultDescription = itemName
    ? `This action cannot be undone. This will permanently delete "${itemName}" and remove all associated data from our servers.`
    : 'This action cannot be undone. This will permanently delete the item and remove all associated data from our servers.';

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn('sm:max-w-[425px]', className)}>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle className="text-lg font-semibold">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <AlertDialogCancel
            disabled={loading}
            className="mt-2 sm:mt-0"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              'bg-destructive text-destructive-foreground hover:bg-destructive/90',
              !destructive && 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

DeleteDialog.displayName = 'DeleteDialog';

// Hook for managing delete dialog state
export function useDeleteDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<any>(null);

  const openDialog = (item?: any) => {
    setItemToDelete(item);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setItemToDelete(null);
    setLoading(false);
  };

  const handleConfirm = async (onDelete: (item: any) => Promise<void>) => {
    if (!itemToDelete) return;
    
    try {
      setLoading(true);
      await onDelete(itemToDelete);
      closeDialog();
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return {
    isOpen,
    loading,
    itemToDelete,
    openDialog,
    closeDialog,
    handleConfirm,
  };
}