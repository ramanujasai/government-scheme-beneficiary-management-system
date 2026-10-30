import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationApi } from '../api/applicationApi';
import { StatusBadge } from '../components/StatusBadge';

export const BeneficiaryDashboardPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    applicationApi.getApplications()
      .then((res) => setApplications(res.applications || []))
      .catch((err) => setError(err.message || 'Could not load applications.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="bg-[#0e0e14] min-h-[90vh] px-4 py-8 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold">My Applications</h1>
          <Link to="/schemes" className="text-sm text-blue-300 underline">View schemes</Link>
        </div>

        {loading ? (
          <p className="py-8 text-sm text-slate-400">Loading applications...</p>
        ) : error ? (
          <p role="alert" className="py-8 text-sm text-red-300">{error}</p>
        ) : applications.length === 0 ? (
          <p className="py-8 text-sm text-slate-400">You have not submitted an application yet.</p>
        ) : (
          <div className="mt-5 overflow-x-auto border border-[#232336] rounded">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-[#161622] text-slate-400">
                <tr>
                  <th className="p-3">Scheme</th>
                  <th className="p-3">Application number</th>
                  <th className="p-3">Submitted</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232336]">
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td className="p-3">
                      <p>{app.scheme?.title || 'Scheme unavailable'}</p>
                      {app.adminRemarks && <p className="mt-1 text-xs text-slate-400">Remarks: {app.adminRemarks}</p>}
                      {app.demoDisbursementReference && <p className="mt-1 text-xs text-slate-400">Demo reference: {app.demoDisbursementReference}</p>}
                    </td>
                    <td className="p-3 font-mono text-xs text-slate-300">{app.applicationNumber}</td>
                    <td className="p-3 text-slate-300">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="p-3"><StatusBadge status={app.status} /></td>
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
