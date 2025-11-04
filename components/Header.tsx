
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center py-8 md:py-12">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
        App Collection Showcase
      </h1>
      <p className="mt-4 text-lg md:text-xl text-gray-400">
        A curated list of projects by{' '}
        <a 
          href="https://github.com/srvs" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
        >
          srvs
        </a>{' '}
        with live GitHub Pages deployments.
      </p>
    </header>
  );
};

export default Header;
