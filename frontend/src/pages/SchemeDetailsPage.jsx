import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { schemeApi } from '../api/schemeApi';
import { useAuth } from '../context/AuthContext';

export const SchemeDetailsPage = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [scheme, setScheme] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    schemeApi.getSchemeById(id)
      .then((res) => setScheme(res.scheme))
      .catch((err) => setError(err.message || 'Could not load scheme.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <main className="bg-[#0e0e14] min-h-[90vh] px-4 py-8 text-sm text-slate-400">Loading scheme...</main>;
  }

  if (error || !scheme) {
    return (
      <main className="bg-[#0e0e14] min-h-[90vh] px-4 py-8 text-white">
        <p role="alert">{error || 'Scheme not found.'}</p>
        <Link to="/schemes" className="inline-block mt-4 text-blue-300 underline">Back to schemes</Link>
      </main>
    );
  }

  return (
    <main className="bg-[#0e0e14] min-h-[90vh] px-4 py-8 text-white">
      <article className="max-w-3xl mx-auto">
        <Link to="/schemes" className="text-sm text-blue-300 underline">Back to schemes</Link>
        <h1 className="mt-5 text-2xl font-bold">{scheme.title}</h1>
        <p className="mt-2 text-sm text-slate-400">{scheme.category} · {scheme.code}</p>
        <p className="mt-4 text-sm text-slate-300">{scheme.fullDescription || scheme.shortDescription}</p>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-400">Benefit</dt>
            <dd className="mt-1">{scheme.benefits?.amountOrValue || scheme.benefits?.summary}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Application deadline</dt>
            <dd className="mt-1">{scheme.applicationDeadline ? new Date(scheme.applicationDeadline).toLocaleDateString() : 'Not specified'}</dd>
          </div>
        </dl>

        <section className="mt-7">
          <h2 className="font-semibold">Eligibility criteria</h2>
          {scheme.eligibilityCriteria?.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
              {scheme.eligibilityCriteria.map((item, index) => <li key={index}>{item.criterion}</li>)}
            </ul>
          ) : <p className="mt-2 text-sm text-slate-400">No criteria listed.</p>}
        </section>

        <section className="mt-6">
          <h2 className="font-semibold">Required documents</h2>
          {scheme.requiredDocuments?.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
              {scheme.requiredDocuments.map((item, index) => <li key={index}>{item.documentName}</li>)}
            </ul>
          ) : <p className="mt-2 text-sm text-slate-400">No documents listed.</p>}
        </section>

        {!isAdmin && (
          <div className="mt-7">
            {scheme.isActive ? (
              <Link to={`/apply/${id}`} className="inline-block rounded bg-[#2563eb] px-4 py-2 text-sm text-white">
                Apply for this scheme
              </Link>
            ) : <p className="text-sm text-slate-400">Applications are closed for this scheme.</p>}
          </div>
        )}
      </article>
    </main>
  );
};
