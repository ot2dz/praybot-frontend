
import React from 'react';
import { LogoIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-white shadow-md">
      <div className="max-w-6xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        <LogoIcon className="w-10 h-10 text-blue-600" />
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Prayer Timetable Extractor
        </h1>
      </div>
    </header>
  );
};

export default Header;
