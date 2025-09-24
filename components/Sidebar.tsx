
import React from 'react';
import { ChatSession } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import ChevronsLeftIcon from './icons/ChevronsLeftIcon';
import ChevronsRightIcon from './icons/ChevronsRightIcon';

interface SidebarProps {
  sessions: ChatSession[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sessions, activeChatId, onNewChat, onSelectChat, onDeleteChat, isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteChat(id);
  }

  return (
    <>
      <aside className={`fixed top-0 right-0 h-full bg-gray-800/90 backdrop-blur-sm border-l border-gray-700 shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 md:shadow-none ${isCollapsed ? 'md:w-20' : 'md:w-72'}`}>
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={onNewChat}
            className={`w-full flex items-center space-x-2 space-x-reverse bg-indigo-600 text-white rounded-lg p-3 hover:bg-indigo-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? "چت جدید" : undefined}
          >
            <PlusIcon className="w-6 h-6 flex-shrink-0" />
            {!isCollapsed && <span>چت جدید</span>}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectChat(session.id)}
              className={`group flex items-center w-full text-right p-3 rounded-lg cursor-pointer transition-colors duration-200 ${isCollapsed ? 'justify-center' : 'justify-between'} ${
                activeChatId === session.id
                  ? 'bg-gray-700'
                  : 'hover:bg-gray-700/50'
              }`}
              title={isCollapsed ? session.title : undefined}
            >
              {!isCollapsed && <span className="truncate text-white text-sm font-medium flex-1 min-w-0">{session.title}</span>}
              
              <button
                onClick={(e) => handleDelete(e, session.id)}
                className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 flex-shrink-0"
                aria-label={`حذف چت ${session.title}`}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </nav>

        {/* --- Collapse Toggle Button --- */}
        <div className="hidden md:block mt-auto p-2 border-t border-gray-700">
            <button
                onClick={onToggleCollapse}
                className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
                aria-label={isCollapsed ? "بزرگ کردن نوار کناری" : "کوچک کردن نوار کناری"}
                title={isCollapsed ? "بزرگ کردن نوار کناری" : "کوچک کردن نوار کناری"}
            >
                {isCollapsed ? <ChevronsRightIcon className="w-5 h-5" /> : <ChevronsLeftIcon className="w-5 h-5" />}
            </button>
        </div>
      </aside>
      {/* Overlay for mobile */}
      {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/60 z-30 md:hidden"></div>}
    </>
  );
};

export default Sidebar;
