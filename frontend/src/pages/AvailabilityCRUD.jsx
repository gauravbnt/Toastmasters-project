import React, { useEffect, useMemo, useState } from 'react';

const API_BASE = 'http://localhost:8080';

function AvailabilityCRUD() {
  const [statusOptions, setStatusOptions] = useState([]);
  const [form, setForm] = useState({ memId: '', meetingId: '', avaStatus: '' });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availabilities, setAvailabilities] = useState([]);
  const [error, setError] = useState('');

  const isFormValid = useMemo(() => {
    return (
      String(form.memId).trim() !== '' &&
      String(form.meetingId).trim() !== '' &&
      String(form.avaStatus).trim() !== ''
    );
  }, [form]);

  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const res = await fetch(`${API_BASE}/availability-status`);
        if (!res.ok) throw new Error('Failed to fetch availability statuses');
        const data = await res.json();
        setStatusOptions(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setForm((f) => ({ ...f, avaStatus: f.avaStatus || data[0] }));
        }
      } catch (e) {
        setError(e.message || 'Error loading status options');
      }
    };

    const fetchAvailabilities = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/availabilities`);
        if (!res.ok) throw new Error('Failed to fetch availabilities');
        const data = await res.json();
        setAvailabilities(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || 'Error loading availabilities');
      } finally {
        setLoading(false);
      }
    };

    fetchStatusOptions();
    fetchAvailabilities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        memId: Number(form.memId),
        meetingId: Number(form.meetingId),
        avaStatus: form.avaStatus,
      };

      const res = await fetch(`${API_BASE}/availabilities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create availability');
      }

      // refresh list
      const listRes = await fetch(`${API_BASE}/availabilities`);
      const listData = await listRes.json();
      setAvailabilities(Array.isArray(listData) ? listData : []);

      // reset memId and meetingId; keep status
      setForm((f) => ({ memId: '', meetingId: '', avaStatus: f.avaStatus }));
    } catch (e) {
      setError(e.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (avId) => {
    if (!avId && avId !== 0) return;
    try {
      const res = await fetch(`${API_BASE}/availabilities/${avId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete availability');
      setAvailabilities((prev) => prev.filter((a) => a.avId !== avId));
    } catch (e) {
      setError(e.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Availability Manager</h1>

      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Add Availability</h2>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col">
            <label htmlFor="memId" className="text-sm text-gray-700 mb-1">Member ID</label>
            <input
              id="memId"
              name="memId"
              type="number"
              className="input"
              placeholder="e.g., 1"
              value={form.memId}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="meetingId" className="text-sm text-gray-700 mb-1">Meeting ID</label>
            <input
              id="meetingId"
              name="meetingId"
              type="number"
              className="input"
              placeholder="e.g., 2"
              value={form.meetingId}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="avaStatus" className="text-sm text-gray-700 mb-1">Availability</label>
            <select
              id="avaStatus"
              name="avaStatus"
              className="input"
              value={form.avaStatus}
              onChange={handleChange}
              required
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isFormValid || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-800">All Availabilities</h2>
          {loading && <span className="text-sm text-gray-500">Loading...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meeting ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {availabilities.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-500" colSpan={5}>No records found</td>
                </tr>
              )}
              {availabilities.map((a) => (
                <tr key={a.avId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{a.avId}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{a.memId}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{a.meetingId}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {a.avaStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(a.avId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AvailabilityCRUD;
