import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { schemeApi } from '../api/schemeApi';

export const SchemeCataloguePage = () => {
  const [schemes, setSchemes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSchemes = async (search = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await schemeApi.getSchemes({ search, status: 'all' });
      setSchemes(res.schemes || []);
    } catch (err) {
      setError(err.message || 'Could not load schemes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchSchemes(searchTerm.trim());
  };

  return (
    <main className="bg-[#0e0e14] min-h-[90vh] px-4 py-8 text-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl font-bold">Government Schemes</h1>
        <form onSubmit={handleSearch} className="flex gap-2 my-5">
          <input
            type="search"
            aria-label="Search schemes"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by scheme name or code"
            className="flex-1 px-3 py-2 rounded bg-[#1b1b2a] border border-[#2f2f47] text-sm text-white"
          />
          <button type="submit" className="px-4 py-2 rounded bg-[#2563eb] text-white">Search</button>
        </form>

        {loading ? (
          <p className="py-8 text-sm text-slate-400">Loading schemes...</p>
        ) : error ? (
          <p role="alert" className="py-4 text-sm text-red-300">{error}</p>
        ) : schemes.length === 0 ? (
          <p className="py-8 text-sm text-slate-400">No schemes found.</p>
        ) : (
          <div className="overflow-x-auto border border-[#232336] rounded">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-[#161622] text-slate-400">
                <tr>
                  <th className="p-3">Scheme</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Benefit</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232336]">
                {schemes.map((scheme) => (
                  <tr key={scheme._id}>
                    <td className="p-3">
                      <p className="font-medium">{scheme.title}</p>
                      <p className="text-xs text-slate-400">{scheme.code}</p>
                    </td>
                    <td className="p-3 text-slate-300">{scheme.category}</td>
                    <td className="p-3 text-slate-300">{scheme.benefits?.amountOrValue}</td>
                    <td className="p-3">
                      <Link to={`/schemes/${scheme._id}`} className="text-blue-300 underline">View details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};
