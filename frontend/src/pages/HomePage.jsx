import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const HomePage = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <section className="bg-[#0e0e14] min-h-[90vh] px-4 py-16 text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">Government Scheme Beneficiary Management System</h1>
        <p className="mt-3 text-sm text-slate-400">
          View government schemes, apply online, and check the status of your application.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link to="/schemes" className="px-4 py-2 rounded bg-[#2563eb] text-white">
            View Schemes
          </Link>
          {isAuthenticated ? (
            <Link to={isAdmin ? '/admin' : '/dashboard'} className="px-4 py-2 rounded border border-[#2f2f47] text-slate-300">
              {isAdmin ? 'Admin Dashboard' : 'My Applications'}
            </Link>
          ) : (
            <Link to="/register" className="px-4 py-2 rounded border border-[#2f2f47] text-slate-300">
              Register
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
