
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <h1 className="text-6xl font-bold text-accent-cyan mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-slate-light mb-2">Page Not Found</h2>
      <p className="text-slate-dark mb-6">The requested view does not exist.</p>
      <Link
        to="/"
        className="px-6 py-3 bg-accent-cyan text-command-blue font-bold rounded-lg hover:bg-opacity-80 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;