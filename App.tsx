
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage as Message, ChatSession } from './types';
import { fetchChatCompletionStream } from './services/chatService';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import LoadingIndicator from './components/LoadingIndicator';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chats and sidebar state from localStorage on initial render
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem('chat_sessions');
      const storedActiveId = localStorage.getItem('active_chat_id');
      const storedCollapsed = localStorage.getItem('sidebar_collapsed');

      if (storedCollapsed) {
        setIsSidebarCollapsed(JSON.parse(storedCollapsed));
      }
      
      if (storedSessions) {
        const parsedSessions: ChatSession[] = JSON.parse(storedSessions);
        if (parsedSessions.length > 0) {
          setChatSessions(parsedSessions);
          setActiveChatId(storedActiveId ? JSON.parse(storedActiveId) : parsedSessions[0].id);
        } else {
          handleNewChat();
        }
      } else {
        handleNewChat();
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
      handleNewChat();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    try {
        if (chatSessions.length > 0) {
            localStorage.setItem('chat_sessions', JSON.stringify(chatSessions));
        } else {
            localStorage.removeItem('chat_sessions');
        }
        if (activeChatId) {
            localStorage.setItem('active_chat_id', JSON.stringify(activeChatId));
        } else {
            localStorage.removeItem('active_chat_id');
        }
    } catch (error) {
        console.error("Failed to save chat history to localStorage", error);
    }
  }, [chatSessions, activeChatId]);

  // Save sidebar collapsed state
  useEffect(() => {
    try {
        localStorage.setItem('sidebar_collapsed', JSON.stringify(isSidebarCollapsed));
    } catch (error) {
        console.error("Failed to save sidebar state to localStorage", error);
    }
  }, [isSidebarCollapsed]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatSessions, activeChatId]);

  const activeChat = chatSessions.find(session => session.id === activeChatId);
  const messages = activeChat ? activeChat.messages : [];

  const handleNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: 'چت جدید',
      messages: [{ role: 'assistant', content: 'سلام! چطور میتونم کمکتون کنم؟' }],
    };
    setChatSessions(prevSessions => [newChat, ...prevSessions]);
    setActiveChatId(newChat.id);
    setIsSidebarOpen(false);
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = (id: string) => {
    setChatSessions(prevSessions => {
        const remainingSessions = prevSessions.filter(session => session.id !== id);
        if (activeChatId === id) {
            if (remainingSessions.length > 0) {
                setActiveChatId(remainingSessions[0].id);
            } else {
                handleNewChat();
                return []; // handleNewChat will create the new session, so return empty to avoid duplicates
            }
        }
        
        if (remainingSessions.length === 0) {
            handleNewChat();
            return [];
        }
        return remainingSessions;
    });
  };

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const updateActiveChat = (updateFn: (chat: ChatSession) => ChatSession) => {
    setChatSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === activeChatId ? updateFn(session) : session
      )
    );
  };
  
  const handleSend = async (userInput: string) => {
    if (!userInput.trim() || !activeChat) return;

    const userMessage: Message = { role: 'user', content: userInput };
    
    const isNewChat = activeChat.messages.length === 1 && activeChat.messages[0].role === 'assistant';
    const newTitle = isNewChat ? userInput.substring(0, 30) + (userInput.length > 30 ? '...' : '') : activeChat.title;

    updateActiveChat(chat => ({
      ...chat,
      title: newTitle,
      messages: [...chat.messages, userMessage],
    }));
    
    setIsLoading(true);

    try {
      const messagesForApi = [...activeChat.messages, userMessage].map(({ role, content }) => ({ role, content }));
      let isFirstChunk = true;
      let assistantResponse = '';

      await fetchChatCompletionStream(messagesForApi, (chunk) => {
        if (isFirstChunk) {
          setIsLoading(false);
          assistantResponse += chunk;
          updateActiveChat(chat => ({
              ...chat,
              messages: [...chat.messages, { role: 'assistant', content: assistantResponse }],
          }));
          isFirstChunk = false;
        } else {
          assistantResponse += chunk;
          updateActiveChat(chat => {
            const newMessages = [...chat.messages];
            newMessages[newMessages.length - 1].content = assistantResponse;
            return { ...chat, messages: newMessages };
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
      updateActiveChat(chat => ({ ...chat, messages: [...chat.messages, errorMessage] }));
    }
  };

  return (
    <div className="bg-gray-900 text-white flex h-screen font-[Vazirmatn] overflow-hidden">
        <Sidebar 
            sessions={chatSessions}
            activeChatId={activeChatId}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleSidebarCollapse}
        />
        <div className={`flex flex-col flex-1 h-full transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'md:mr-20' : 'md:mr-72'}`}>
            <Header onMenuClick={() => setIsSidebarOpen(s => !s)} />
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
    </div>
  );
};

export default App;
