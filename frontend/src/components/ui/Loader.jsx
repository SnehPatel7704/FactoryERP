import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ size = 'default', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <Loader2 className={`animate-spin text-blue-500 ${sizeClasses[size]}`} />
      {text && <p className="mt-2 text-sm text-gray-500 font-medium">{text}</p>}
    </div>
  );
};

export default Loader;
