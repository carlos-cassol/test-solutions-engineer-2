import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-test-radar-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-test-radar-600 font-bold text-sm">TR</span>
            </div>
            <span className="text-white font-bold text-xl">Test Radar</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-white hover:text-test-radar-200 transition-colors"
            >
              Dashboard
            </Link>
            <div className="text-white text-sm">
              Control Tower
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 