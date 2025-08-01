"use client";
import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface BrowserLayoutProps {
  children: ReactNode;
}

const BrowserLayout = ({ children }: BrowserLayoutProps) => {
  const pathname = usePathname();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  
  // Updated tabs array with Home tab removed
  const tabs = [
    { name: 'About', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: 'Blog', path: '/blog' },
    { name: 'Resume', path: '/resume' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsMaximized(false);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    setIsClosed(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
    setIsClosed(false);
  };

  if (isClosed) {
    return (
      <AnimatePresence>
        <motion.div 
          className="max-w-6xl mx-auto my-8 text-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <motion.div 
            className="cursor-pointer inline-block"
            onClick={handleRestore}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              className="relative w-32 h-32 mx-auto mb-4"
              initial={{ rotate: -180 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image 
                src="/profile.png" 
                alt="Your Name" 
                fill
                className="object-cover rounded-full"
              />
            </motion.div>
            <motion.p 
              className="text-lg font-medium"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Click to reopen portfolio
            </motion.p>
            <motion.div 
              className="flex justify-center gap-4 mt-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
              </a>
              <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (isMinimized) {
    return (
      <motion.div 
        className="max-w-6xl mx-auto my-8 bg-gray-100 p-3 rounded-t-lg border border-gray-200 cursor-pointer"
        onClick={handleRestore}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex space-x-2 mr-4">
              {/* Windows-style window controls */}
              <div className="w-3 h-3 rounded-sm bg-blue-500 hover:bg-blue-400"></div>
              <div className="w-3 h-3 rounded-sm bg-gray-400 hover:bg-gray-300"></div>
              <div className="w-3 h-3 rounded-sm bg-red-500 hover:bg-red-400"></div>
            </div>
            <span className="text-sm font-medium">Steven&apos;s Portfolio (Minimized)</span>
          </div>
          <span className="text-xs text-gray-500">Click to restore</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`max-w-6xl mx-auto my-8 rounded-lg overflow-hidden shadow-2xl border border-gray-200 transition-all duration-300 ${isMaximized ? 'fixed inset-4 max-w-none z-50' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {/* Browser Chrome - Windows Style */}
      <div className="bg-gray-100 border-b border-gray-200">
        {/* Title bar */}
        <div className="flex items-center justify-between px-3 py-2 text-gray-900">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M0 0h24v24H0z" fill="none"/>
              <path d="M4 8h16V6H4v2zm0 2h16v2H4v-2zm0 6h16v-2H4v2zm0 2h16v2H4v-2z"/>
            </svg>
            <span className="text-sm font-medium">Steven&apos;s Portfolio</span>
          </div>
          <div className="flex space-x-2">
            {/* Windows-style window controls */}
            <button 
              onClick={handleMinimize}
              className="w-6 h-6 flex items-center justify-center hover:bg-gray-300 transition-colors"
              aria-label="Minimize"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                <path d="M14 8v1H3V8h11z"/>
              </svg>
            </button>
            <button 
              onClick={handleMaximize}
              className="w-6 h-6 flex items-center justify-center hover:bg-gray-300 transition-colors"
              aria-label="Maximize"
            >
              {isMaximized ? (
                <svg
                className="w-3 h-3 text-gray-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2 5h8v8H2V5zM5 3h8v8h-2V5H5V3z" />
              </svg>
              ) : (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3 3h10v10H3V3zm1 1v8h8V4H4z"/>
                </svg>
              )}
            </button>
            <button 
              onClick={handleClose}
              className="w-6 h-6 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          </div>
        </div>
        
        {/* URL Bar */}
        <div className="px-3 py-2">
          <div className="flex-1 bg-white rounded-sm px-3 py-1 text-sm text-gray-600 border border-gray-300 flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
            </svg>
            stevensportfolio.com{pathname}
          </div>
        </div>
        
        {/* Browser Tabs */}
        <div className="flex px-3">
          
          {tabs.map((tab) => {
            const isActive = 
              pathname === tab.path || 
              (tab.path === '/about' && pathname === '/') || 
              (tab.path.includes('#') && pathname === tab.path.split('#')[0]);
            
            return (
              <Link 
                key={tab.path} 
                href={tab.path}
                className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                  isActive 
                    ? 'bg-gray-700 text-black-600 border-t border-l border-r border-gray-200' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Browser Content */}
      <div className="bg-white p-6 overflow-auto" style={isMaximized ? {maxHeight: 'calc(100vh - 120px)'} : {}}>
        {children}
      </div>
    </motion.div>
  );
};

export default BrowserLayout;