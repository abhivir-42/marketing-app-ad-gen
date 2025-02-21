'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const FORM_DATA_STORAGE_KEY = 'scriptGenerationFormData';

const Header: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const handleHomeClick = () => {
    // Clear form data when navigating to home
    localStorage.removeItem(FORM_DATA_STORAGE_KEY);
  };

  return (
    <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" onClick={handleHomeClick} className="text-white font-bold text-xl">
              Ad Generator
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/"
              onClick={handleHomeClick}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') 
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              href="/script"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/script')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Create Ad
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header; 