
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage as Message } from './types';
import { fetchChatCompletionStream } from './services/chatService';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import LoadingIndicator from './components/LoadingIndicator';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'سلام! چطور میتونم کمکتون کنم؟' }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (userInput: string) => {
    if (!userInput.trim()) return;

    const userMessage: Message = { role: 'user', content: userInput };
    const messagesForApi = [...messages, userMessage];
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      const apiMessages = messagesForApi.map(({ role, content }) => ({ role, content }));
      let isFirstChunk = true;

      await fetchChatCompletionStream(apiMessages, (chunk) => {
        if (isFirstChunk) {
          setIsLoading(false);
          setMessages(prev => [...prev, { role: 'assistant', content: chunk }]);
          isFirstChunk = false;
        } else {
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content += chunk;
            return newMessages;
          });
        }
      });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'متاسفانه خطایی رخ داده است. لطفا دوباره تلاش کنید.',
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  };

  return (
    <div className="bg-gray-900 text-white flex flex-col h-screen font-[Vazirmatn]">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex items-center space-x-2 space-x-reverse">
                <LoadingIndicator />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
};

export default App;