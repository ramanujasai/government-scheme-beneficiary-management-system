import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <main className="min-h-[90vh] bg-[#0e0e14] px-4 py-16 text-white">
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-sm text-slate-400">The page or scheme you requested does not exist.</p>
      <Link to="/" className="mt-5 inline-block text-sm text-blue-300 underline">Return home</Link>
    </div>
  </main>
);
