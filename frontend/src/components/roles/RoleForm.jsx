import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { roleService } from '../../services/roleService';
import { toast } from 'react-hot-toast';

const RoleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState({
    roleName: '',
    roleDescription: ''
  });

  useEffect(() => {
    if (id) {
      loadRole();
    }
  }, [id]);

  const loadRole = async () => {
    try {
      setLoading(true);
      const data = await roleService.getRoleById(id);
      setRole(data);
    } catch (err) {
      toast.error('Failed to load role');
      navigate('..');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRole(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (id) {
        await roleService.updateRole(id, role);
        toast.success('Role updated successfully');
      } else {
        await roleService.createRole(role);
        toast.success('Role created successfully');
      }
      navigate('..');
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) return <div className="text-center py-8">Loading role data...</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{id ? 'Edit' : 'Add New'} Role</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">

          <div>
            <label htmlFor="roleName" className="block text-sm font-medium text-gray-700">
              Role Name *
            </label>
            <input
              type="text"
              id="roleName"
              name="roleName"
              value={role.roleName}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="roleDescription" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="roleDescription"
              name="roleDescription"
              rows={3}
              value={role.roleDescription}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/roles')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleForm;
