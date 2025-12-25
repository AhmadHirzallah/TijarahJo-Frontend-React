
import React from 'react';

const Loader: React.FC<{ fullScreen?: boolean }> = ({ fullScreen }) => {
  return (
    <div className={`${fullScreen ? 'fixed inset-0 bg-white/80' : 'w-full py-12'} flex flex-col items-center justify-center z-50`}>
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600 font-medium animate-pulse">Processing your request...</p>
    </div>
  );
};

export default Loader;
