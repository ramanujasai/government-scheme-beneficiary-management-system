import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { schemeApi } from '../api/schemeApi';
import { applicationApi } from '../api/applicationApi';
import { StatusBadge } from '../components/StatusBadge';

const categories = [
  'Agriculture & Farming',
  'Education & Skill',
  'Healthcare',
  'Housing & Sanitation',
  'Women & Child Development',
  'Senior Citizen & Social Security',
  'Financial Inclusion & Microenterprise'
];

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [editingScheme, setEditingScheme] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0]);
  const [newBenefit, setNewBenefit] = useState('');
  const [newCode, setNewCode] = useState(`SCH-GEN-${Math.floor(100 + Math.random() * 900)}`);
  const [newShortDescription, setNewShortDescription] = useState('');
  const [newFullDescription, setNewFullDescription] = useState('');
  const [eligibilityText, setEligibilityText] = useState('');
  const [documentsText, setDocumentsText] = useState('');
  const [savingScheme, setSavingScheme] = useState(false);

  const [beneficiarySearch, setBeneficiarySearch] = useState('');
  const [currentApp, setCurrentApp] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await applicationApi.getApplications();
      setApplications(res.applications || []);
    } catch (err) {
      setError(err.message || 'Could not load applications.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchemes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await schemeApi.getSchemes({ status: 'all' });
      setSchemes(res.schemes || []);
    } catch (err) {
      setError(err.message || 'Could not load schemes.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBeneficiaries = async (search = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getBeneficiaries({ search });
      setBeneficiaries(res.beneficiaries || []);
    } catch (err) {
      setError(err.message || 'Could not load beneficiaries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'applications') fetchApps();
    if (activeTab === 'schemes') fetchSchemes();
    if (activeTab === 'beneficiaries') fetchBeneficiaries();
  }, [activeTab]);

  const clearSchemeForm = () => {
    setEditingScheme(null);
    setNewTitle('');
    setNewCategory(categories[0]);
    setNewBenefit('');
    setNewShortDescription('');
    setNewFullDescription('');
    setEligibilityText('');
    setDocumentsText('');
    setNewCode(`SCH-GEN-${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleSaveScheme = async (event) => {
    event.preventDefault();
    setError('');
    setSavingScheme(true);

    const schemeData = {
      title: newTitle.trim(),
      code: newCode.trim(),
      category: newCategory,
      shortDescription: newShortDescription.trim(),
      fullDescription: newFullDescription.trim(),
      eligibilityCriteria: eligibilityText.split('\n').map((value) => value.trim()).filter(Boolean).map((criterion) => ({ criterion })),
      requiredDocuments: documentsText.split('\n').map((value) => value.trim()).filter(Boolean).map((documentName) => ({ documentName }))
    };

    try {
      if (editingScheme) {
        await schemeApi.updateScheme(editingScheme._id, {
          ...schemeData,
          'benefits.amountOrValue': newBenefit.trim()
        });
      } else {
        await schemeApi.createScheme({
          ...schemeData,
          sponsoringDepartment: 'Department of Public Welfare',
          benefits: { summary: newBenefit.trim(), amountOrValue: newBenefit.trim(), type: 'Direct Financial Subsidy' },
          applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
        });
      }
      clearSchemeForm();
      await fetchSchemes();
    } catch (err) {
      setError(err.message || 'Could not save scheme.');
    } finally {
      setSavingScheme(false);
    }
  };

  const handleEditScheme = (scheme) => {
    setEditingScheme(scheme);
    setNewTitle(scheme.title);
    setNewCode(scheme.code);
    setNewCategory(scheme.category);
    setNewBenefit(scheme.benefits?.amountOrValue || '');
    setNewShortDescription(scheme.shortDescription || '');
    setNewFullDescription(scheme.fullDescription || '');
    setEligibilityText((scheme.eligibilityCriteria || []).map((item) => item.criterion).join('\n'));
    setDocumentsText((scheme.requiredDocuments || []).map((item) => item.documentName).join('\n'));
  };

  const handleToggleScheme = async (id) => {
    setError('');
    try {
      await schemeApi.toggleSchemeStatus(id);
      await fetchSchemes();
    } catch (err) {
      setError(err.message || 'Could not update scheme status.');
    }
  };

  const handleOpenReview = (app) => {
    if (currentApp?._id === app._id) {
      setCurrentApp(null);
      return;
    }
    setCurrentApp(app);
    setError('');
    setRemarks('');
    setTargetStatus({
      Submitted: 'Under Review',
      'Under Review': 'Approved',
      Approved: 'Disbursed',
      Rejected: 'Under Review'
    }[app.status] || 'Under Review');
  };

  const handleStatusUpdate = async (event) => {
    event.preventDefault();
    setError('');
    setUpdating(true);
    try {
      await applicationApi.updateStatus(currentApp._id, { status: targetStatus, remarks });
      setCurrentApp(null);
      await fetchApps();
    } catch (err) {
      setError(err.data?.message || err.message || 'Could not update application.');
    } finally {
      setUpdating(false);
    }
  };

  const handleBeneficiarySearch = (event) => {
    event.preventDefault();
    fetchBeneficiaries(beneficiarySearch.trim());
  };

  return (
    <main className="bg-[#0e0e14] min-h-[90vh] px-4 py-8 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <nav className="mt-5 flex flex-wrap gap-2" aria-label="Admin sections">
          {['applications', 'schemes', 'beneficiaries'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              aria-current={activeTab === tab ? 'page' : undefined}
              className={`px-3 py-2 rounded text-sm capitalize ${activeTab === tab ? 'bg-[#2563eb] text-white' : 'border border-[#2f2f47] text-slate-300'}`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
        {loading && <p className="mt-4 text-sm text-slate-400">Loading...</p>}

        {activeTab === 'applications' && !loading && (
          <div className="mt-5 overflow-x-auto border border-[#232336] rounded">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#161622] text-slate-400">
                <tr>
                  <th className="p-3">Applicant</th>
                  <th className="p-3">Scheme</th>
                  <th className="p-3">Submitted</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232336]">
                {applications.length === 0 && !error && <tr><td colSpan="5" className="p-4 text-slate-400">No applications found.</td></tr>}
                {applications.map((app) => (
                  <React.Fragment key={app._id}>
                    <tr>
                      <td className="p-3">{app.applicantDetails?.fullName}<p className="text-xs text-slate-400">{app.applicantDetails?.phone}</p></td>
                      <td className="p-3">{app.scheme?.title}</td>
                      <td className="p-3 text-slate-300">{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td className="p-3"><StatusBadge status={app.status} /></td>
                      <td className="p-3">
                        <button type="button" onClick={() => handleOpenReview(app)} className="text-blue-300 underline">
                          {currentApp?._id === app._id ? 'Close' : 'Review'}
                        </button>
                      </td>
                    </tr>
                    {currentApp?._id === app._id && (
                      <tr>
                        <td colSpan="5" className="p-4 bg-[#161622]">
                          <div className="grid gap-4 sm:grid-cols-2 text-sm text-slate-300">
                            <div>
                              <h2 className="font-semibold text-white">Application details</h2>
                              <p className="mt-2">Phone: {app.applicantDetails?.phone}</p>
                              <p>Address: {app.applicantDetails?.address}, {app.applicantDetails?.district}</p>
                              <p>Annual income: {app.applicantDetails?.annualIncome}</p>
                              <p className="mt-2">Purpose: {app.schemeSpecificData?.purposeOfAssistance}</p>
                            </div>
                            <div>
                              <h2 className="font-semibold text-white">Eligibility and documents</h2>
                              <ul className="mt-2 list-disc pl-5">
                                {(app.schemeSpecificData?.eligibilityDeclarations || []).map((item, index) => <li key={index}>{item.criterion}: {item.declaredEligible ? 'Confirmed' : 'Not confirmed'}</li>)}
                                {(app.documents || []).map((item, index) => <li key={`doc-${index}`}>{item.documentName} (listed)</li>)}
                              </ul>
                            </div>
                          </div>
                          <form onSubmit={handleStatusUpdate} className="mt-4 grid gap-3 sm:grid-cols-2">
                            <label className="text-slate-300">Update status
                              <select value={targetStatus} onChange={(event) => setTargetStatus(event.target.value)} className="mt-1 w-full rounded border border-[#2f2f47] bg-[#1b1b2a] px-3 py-2 text-white">
                                {app.status === 'Submitted' && <option value="Under Review">Under Review</option>}
                                {app.status === 'Under Review' && <><option value="Approved">Approved</option><option value="Rejected">Rejected</option></>}
                                {app.status === 'Approved' && <option value="Disbursed">Disbursed</option>}
                                {app.status === 'Rejected' && <option value="Under Review">Under Review (Re-evaluate)</option>}
                              </select>
                            </label>
                            <label className="text-slate-300">Remarks{targetStatus === 'Rejected' ? ' (required)' : ''}
                              <textarea rows="2" required={targetStatus === 'Rejected'} value={remarks} onChange={(event) => setRemarks(event.target.value)} className="mt-1 w-full rounded border border-[#2f2f47] bg-[#1b1b2a] px-3 py-2 text-white" />
                            </label>
                            <button type="submit" disabled={updating} className="justify-self-start rounded bg-[#2563eb] px-4 py-2 text-sm text-white sm:col-span-2">
                              {updating ? 'Saving...' : 'Save Decision'}
                            </button>
                          </form>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'schemes' && !loading && (
          <section className="mt-5">
            <h2 className="text-lg font-semibold">{editingScheme ? 'Update Scheme' : 'Add Scheme'}</h2>
            <form onSubmit={handleSaveScheme} className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
              <label className="text-slate-300">Title
                <input required value={newTitle} onChange={(event) => setNewTitle(event.target.value)} className="mt-1 w-full rounded border border-[#2f2f47] bg-[#1b1b2a] px-3 py-2 text-white" />
              </label>
              <label className="text-slate-300">Scheme code
                <input required value={newCode} onChange={(event) => setNewCode(event.target.value)} className="mt-1 w-full rounded border border-[#2f2f47] bg-[#1b1b2a] px-3 py-2 text-white" />
              </label>
              <label className="text-slate-300">Category
                <select value={newCategory} onChange={(event) => setNewCategory(event.target.value)} className="mt-1 w-full rounded border border-[#2f2f47] bg-[#1b1b2a] px-3 py-2 text-white">
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label className="text-slate-300">Benefit amount or value
                <input required value={newBenefit} onChange={(event) => setNewBenefit(event.target.value)} className="mt-1 w-full rounded border border-[#2f2f47] bg-[#1b1b2a] px-3 py-2 text-white" />
              </label>
              <label className="text-slate-300">Short description
                <input required value={newShortDescription} onChange={(event) => setNewShortDescription(event.target.value)} className="mt-1 w-full rounded border border-[#2f2f47] bg-[#1b1b2a] px-3 py-2 text-white" />
              </label>
              <label className="text-slate-300 sm:col-span-2">Description
                <textarea required rows="2" value={newFullDescription} onChange={(event) => setNewFullDescription(event.target.value)} className="mt-1 w-full rounded border border-[#2f2f47] bg-[#1b1b2a] px-3 py-2 text-white" />
              </label>
              <label className="text-slate-300">Eligibility criteria (one per line)
                <textarea rows="3" value={eligibilityText} onChange={(event) => setEligibilityText(event.target.value)} className="mt-1 w-full rounded border border-[#2f2f47] bg-[#1b1b2a] px-3 py-2 text-white" />
              </label>
              <label className="text-slate-300">Required documents (one per line)
                <textarea rows="3" value={documentsText} onChange={(event) => setDocumentsText(event.target.value)} className="mt-1 w-full rounded border border-[#2f2f47] bg-[#1b1b2a] px-3 py-2 text-white" />
              </label>
              <div className="flex gap-3 sm:col-span-2">
                <button type="submit" disabled={savingScheme} className="rounded bg-[#2563eb] px-4 py-2 text-white">{savingScheme ? 'Saving...' : editingScheme ? 'Save Changes' : 'Add Scheme'}</button>
                {editingScheme && <button type="button" onClick={clearSchemeForm} className="text-slate-300 underline">Cancel</button>}
              </div>
            </form>

            <div className="mt-7 overflow-x-auto border border-[#232336] rounded">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-[#161622] text-slate-400"><tr><th className="p-3">Scheme</th><th className="p-3">Category</th><th className="p-3">Benefit</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
                <tbody className="divide-y divide-[#232336]">
                  {schemes.length === 0 && !error && <tr><td colSpan="5" className="p-4 text-slate-400">No schemes found.</td></tr>}
                  {schemes.map((scheme) => (
                    <tr key={scheme._id}>
                      <td className="p-3">{scheme.title}<p className="text-xs text-slate-400">{scheme.code}</p></td>
                      <td className="p-3 text-slate-300">{scheme.category}</td>
                      <td className="p-3 text-slate-300">{scheme.benefits?.amountOrValue}</td>
                      <td className="p-3 text-slate-300">{scheme.isActive ? 'Open' : 'Closed'}</td>
                      <td className="p-3"><button type="button" onClick={() => handleEditScheme(scheme)} className="mr-3 text-blue-300 underline">Edit</button><button type="button" onClick={() => handleToggleScheme(scheme._id)} className="text-slate-300 underline">{scheme.isActive ? 'Close' : 'Reopen'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'beneficiaries' && !loading && (
          <section className="mt-5">
            <form onSubmit={handleBeneficiarySearch} className="flex gap-2">
              <input type="search" aria-label="Search beneficiaries" value={beneficiarySearch} onChange={(event) => setBeneficiarySearch(event.target.value)} placeholder="Search name, phone, district, or application number" className="flex-1 rounded border border-[#2f2f47] bg-[#1b1b2a] px-3 py-2 text-sm text-white" />
              <button type="submit" className="rounded bg-[#2563eb] px-4 py-2 text-sm text-white">Search</button>
            </form>
            <div className="mt-4 overflow-x-auto border border-[#232336] rounded">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-[#161622] text-slate-400"><tr><th className="p-3">Beneficiary</th><th className="p-3">Scheme</th><th className="p-3">Application number</th><th className="p-3">Status</th></tr></thead>
                <tbody className="divide-y divide-[#232336]">
                  {beneficiaries.length === 0 && !error && <tr><td colSpan="4" className="p-4 text-slate-400">No beneficiaries found.</td></tr>}
                  {beneficiaries.map((beneficiary) => (
                    <tr key={beneficiary._id}>
                      <td className="p-3">{beneficiary.applicantDetails?.fullName}<p className="text-xs text-slate-400">{beneficiary.applicantDetails?.phone}</p></td>
                      <td className="p-3">{beneficiary.scheme?.title}</td>
                      <td className="p-3 font-mono text-xs text-slate-300">{beneficiary.applicationNumber}</td>
                      <td className="p-3"><StatusBadge status={beneficiary.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};
