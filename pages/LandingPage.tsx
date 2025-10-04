import React from 'react';
import { Link } from 'react-router-dom';
import { ROLES } from '../constants';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-command-blue text-center p-4 animate-fadeIn">
      <div className="flex items-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-accent-cyan mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <h1 className="text-6xl font-bold text-slate-light">BorderSentinel</h1>
      </div>
      <p className="text-xl text-slate-dark mb-12">AI-Powered Surveillance Dashboard for Enhanced Situational Awareness.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
        {ROLES.map(({ role, path }) => (
          <Link 
            to={path} 
            key={role}
            className="group bg-navy-light p-8 rounded-lg shadow-lg hover:shadow-accent-cyan/20 hover:-translate-y-2 transition-all duration-300"
            aria-label={`Navigate to ${role} view`}
          >
            <h2 className="text-2xl font-bold text-accent-cyan mb-2 group-hover:text-white transition-colors">{role}</h2>
            <p className="text-slate-dark">Access the dashboard tailored for {role.toLowerCase()} operations.</p>
          </Link>
        ))}
      </div>
       <div className="mt-20 text-xs text-slate-dark">
        <p>&copy; 2024 BorderSentinel Corp. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default LandingPage;
