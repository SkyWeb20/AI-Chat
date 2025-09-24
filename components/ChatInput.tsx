
import React, { useState } from 'react';
import SendIcon from './icons/SendIcon';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSend(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <footer className="bg-gray-800/70 backdrop-blur-sm p-4 border-t border-gray-700 sticky bottom-0">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3 space-x-reverse max-w-4xl mx-auto">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="پیام خود را تایپ کنید..."
          rows={1}
          className="flex-1 bg-gray-700 text-white rounded-lg p-3 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200 placeholder-gray-400 disabled:opacity-50"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transform hover:scale-110 disabled:scale-100"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </form>
    </footer>
  );
};

export default ChatInput;
