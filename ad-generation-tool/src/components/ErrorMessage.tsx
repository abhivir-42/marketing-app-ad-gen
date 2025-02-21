'use client';

import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
      {message}
    </div>
  );
};

export default ErrorMessage; 