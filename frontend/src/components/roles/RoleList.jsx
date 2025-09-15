import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { roleService } from '../../services/roleService';
import { toast } from 'react-hot-toast';

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (err) {
      setError('Failed to load roles');
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await roleService.deleteRole(id);
        toast.success('Role deleted successfully');
        loadRoles();
      } catch (err) {
        toast.error('Failed to delete role');
      }
    }
  };

  if (loading) return <div className="text-center py-8">Loading roles...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Roles</h3>
        <Link
          to="add"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Role
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role.roleId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {role.roleId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {role.roleName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {role.roleDescription}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`edit/${role.roleId}`}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 hover:text-yellow-800 rounded-md transition-colors duration-200 mr-2"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(role.roleId)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-800 rounded-md transition-colors duration-200"
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
  );
};

export default RoleList;
