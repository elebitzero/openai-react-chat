import React, {useCallback, useState} from 'react';
import Button from './Button';
import ReactDOM from 'react-dom';

interface DialogOptions {
  message: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmButtonVariant?: 'primary' | 'secondary' | 'critical';
}

interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonVariant?: 'primary' | 'secondary' | 'critical';
}

type UseDialogOptions = Omit<ConfirmDialogProps, 'isOpen'>;

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
                                                       isOpen,
                                                       message,
                                                       confirmText,
                                                       onConfirm,
                                                       onCancel,
                                                       confirmButtonVariant
                                                     }) => {
  if (!isOpen) {
    return null;
  }

  return ReactDOM.createPortal(
      (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-850">
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">{message}</h3>
                <div className="flex justify-center space-x-4 items-center px-4 py-3">
                  <Button
                      onClick={onConfirm}
                      variant={confirmButtonVariant || "primary"}
                  >
                    {confirmText}
                  </Button>
                  <Button
                      onClick={onCancel}
                      variant="secondary"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
      ),
      document.getElementById('modal-root')!
  );
};

export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogProps, setDialogProps] = useState<UseDialogOptions>({
    message: '',
    confirmText: 'OK',
    onConfirm: () => {
      setIsOpen(false);
    },
    onCancel: () => {
      setIsOpen(false);
    },
  });

  const showConfirmDialog = useCallback((options: DialogOptions) => {
    setDialogProps({
      message: options.message,
      confirmText: options.confirmText || 'OK',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel || (() => setIsOpen(false)),
      confirmButtonVariant: options.confirmButtonVariant,
    });
    setIsOpen(true);
  }, []);

  const handleConfirm = useCallback(() => {
    dialogProps.onConfirm();
    setIsOpen(false);
  }, [dialogProps]);

  const handleCancel = useCallback(() => {
    dialogProps.onCancel?.();
    setIsOpen(false);
  }, [dialogProps]);

  // Return showDialog function and Dialog component
  return {
    showConfirmDialog,
    ConfirmDialog: isOpen ? (
        <ConfirmDialog
            isOpen={isOpen}
            message={dialogProps.message}
            confirmText={dialogProps.confirmText}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            confirmButtonVariant={dialogProps.confirmButtonVariant}
        />
    ) : null,
    isOpen
  };
};

export default ConfirmDialog;
