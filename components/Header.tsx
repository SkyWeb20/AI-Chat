
import React from 'react';
import BotIcon from './icons/BotIcon';
import MenuIcon from './icons/MenuIcon';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm p-4 border-b border-gray-700 shadow-lg flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                <BotIcon className="w-6 h-6 text-white"/>
            </div>
            <div>
                <h1 className="text-xl font-bold text-white">دستیار هوشمند</h1>
                <p className="text-sm text-green-400">آنلاین</p>
            </div>
        </div>
        <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-md hover:bg-gray-700 transition-colors"
            aria-label="باز کردن تاریخچه چت"
        >
            <MenuIcon className="w-6 h-6 text-white" />
        </button>
    </header>
  );
};

export default Header;
