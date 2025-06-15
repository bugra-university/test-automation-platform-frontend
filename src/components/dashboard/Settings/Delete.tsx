import React, { useState } from 'react';
import AlertDelete from '../Alert/AlertDelete';
import ProductBacklogService from '../../../api/ProductBacklogService';

/**
 * Delete utility for managing deletion/removal of content elements
 */
interface DeleteProps {
  isTableVisible: boolean;
  setShowTable: React.Dispatch<React.SetStateAction<boolean>>;
  fileName?: string; // Add optional fileName property
  onDeleteSuccess?: () => void; // Optional callback for successful deletion
}

/**
 * Component for rendering the delete dialog
 */
export const DeleteDialog: React.FC<{
  showDialog: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  fileName: string;
  isDeleting?: boolean;
}> = ({ showDialog, onCancel, onConfirm, fileName, isDeleting = false }) => {
  return (
    <AlertDelete
      isOpen={showDialog}
      onClose={onCancel}
      onConfirm={onConfirm}
      title={fileName}
      isDeleting={isDeleting}
    />
  );
};

/**
 * Handles the deletion functionality (clearing the table view)
 * @param isTableVisible - Flag indicating if the table is currently visible
 * @param setShowTable - Function to update table visibility state
 * @returns Object containing the handleDelete function and dialog state
 */
export const Delete = ({ 
  isTableVisible,
  setShowTable,
  fileName = "this table", // Default to "this table" if no fileName provided
  onDeleteSuccess
}: DeleteProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Function to handle delete action
  const handleDelete = () => {
    if (isTableVisible) {
      // Show custom delete confirmation dialog
      setShowDeleteDialog(true);
    } else {
      alert('No table is currently displayed');
    }
  };
  // Function to confirm deletion
  const confirmDelete = async () => {
    setIsDeleting(true);
    
    try {
      // For now, we only clear the table view (UI state)
      // Physical file deletion is handled in DatabaseSyncTab
      console.log('Clearing table view...');
      
      // Set table visibility to false to return to upload screen
      setShowTable(false);
      setShowDeleteDialog(false);
      
      // Call success callback if provided
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
      
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Failed to delete data from database. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to cancel deletion
  const cancelDelete = () => {
    setShowDeleteDialog(false);
  };  return { 
    handleDelete,
    showDeleteDialog,
    cancelDelete,
    confirmDelete,
    isDeleting
  };
};

export default Delete;


