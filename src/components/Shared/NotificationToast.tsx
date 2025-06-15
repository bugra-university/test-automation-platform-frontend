import React from 'react';

interface NotificationToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose?: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  type = 'info',
  onClose
}) => {
  // Map for background and text colors based on type
  const colorMap = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200'
  };
  
  return (
    <div className={`fixed bottom-4 right-4 max-w-sm p-4 rounded-lg border shadow-sm 
                    ${colorMap[type]} animate-in slide-in-from-bottom duration-300`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{message}</p>
        {onClose && (
          <button 
            onClick={onClose}
            className="ml-3 rounded-md p-1 hover:bg-white/20"
            aria-label="Close notification"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationToast;
