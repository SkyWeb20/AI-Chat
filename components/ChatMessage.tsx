import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage as Message } from '../types';
import UserIcon from './icons/UserIcon';
import BotIcon from './icons/BotIcon';
import CodeBlock from './CodeBlock';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center mt-1">
            <BotIcon className="w-5 h-5 text-indigo-400" />
        </div>
      )}
      <div
        className={`max-w-md md:max-w-lg lg:max-w-2xl rounded-2xl text-white shadow-md transition-all duration-300 ${
          isUser
            ? 'bg-indigo-600 rounded-br-lg p-4'
            : 'bg-gray-700 rounded-bl-lg p-4'
        }`}
      >
        {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code: CodeBlock,
                    h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-4 mb-2 border-b border-gray-600 pb-2" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-3 mb-1" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 my-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 my-2" {...props} />,
                    a: ({node, ...props}) => <a className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                }}
            >
                {message.content}
            </ReactMarkdown>
        )}
      </div>
       {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center mt-1">
            <UserIcon className="w-5 h-5 text-gray-300" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;