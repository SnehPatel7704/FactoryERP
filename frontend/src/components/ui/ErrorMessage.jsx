import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ error, retryFunction = null }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
        <p className="text-sm text-red-600 mt-1">{error}</p>
        
        {retryFunction && (
          <button
            onClick={retryFunction}
            className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
