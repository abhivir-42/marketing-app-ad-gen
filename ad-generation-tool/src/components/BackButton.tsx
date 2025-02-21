import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  href: string;
  showConfirmation?: boolean;
  confirmationMessage?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  href,
  showConfirmation = false,
  confirmationMessage = 'Are you sure you want to go back? Any unsaved changes will be lost.'
}) => {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);

  const handleBack = () => {
    if (showConfirmation) {
      setShowDialog(true);
    } else {
      router.push(href);
    }
  };

  return (
    <>
      <button
        onClick={handleBack}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 hover:text-white"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Confirm Navigation</h3>
            <p className="text-gray-300 mb-6">{confirmationMessage}</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => router.push(href)}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BackButton; 