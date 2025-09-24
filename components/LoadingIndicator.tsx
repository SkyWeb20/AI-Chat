
import React from 'react';
import BotIcon from './icons/BotIcon';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-end gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center">
            <BotIcon className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="bg-gray-700 rounded-2xl rounded-bl-lg p-4 flex items-center space-x-2 space-x-reverse">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        </div>
    </div>
  );
};

export default LoadingIndicator;
