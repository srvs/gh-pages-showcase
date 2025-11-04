
import React from 'react';

interface ErrorProps {
  message: string;
}

const Error: React.FC<ErrorProps> = ({ message }) => {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="bg-red-900/50 border border-red-700 text-red-300 px-6 py-4 rounded-lg shadow-lg" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline ml-2">{message}</span>
      </div>
    </div>
  );
};

export default Error;
