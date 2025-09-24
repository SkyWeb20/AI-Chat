import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';

interface CodeBlockProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ node, inline, className, children, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  };
  
  if (inline) {
    return <code className="bg-gray-800 text-indigo-300 rounded-md px-1.5 py-0.5 font-mono text-sm" {...props}>{children}</code>;
  }

  return match ? (
    <div className="relative bg-[#282c34] rounded-lg my-2 shadow-lg -mx-4 sm:mx-0">
      <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-2 rounded-t-lg">
        <span className="text-xs font-sans">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 space-x-reverse text-xs bg-gray-700 hover:bg-gray-600 rounded-md px-2 py-1 transition-colors duration-200"
        >
          {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
          <span>{isCopied ? 'کپی شد!' : 'کپی'}</span>
        </button>
      </div>
      <SyntaxHighlighter
        {...props}
        style={atomDark}
        language={lang}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: '0 0 0.5rem 0.5rem', padding: '1rem', backgroundColor: '#282c34', fontSize: '0.9rem' }}
        codeTagProps={{ style: { fontFamily: 'inherit' } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  ) : (
     <pre className="bg-gray-800 rounded-lg p-4 font-mono text-white overflow-x-auto my-2 -mx-4 sm:mx-0" {...props}>
        <code>{children}</code>
    </pre>
  );
};

export default CodeBlock;