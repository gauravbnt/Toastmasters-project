import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { memberService } from '../../services/memberService';
import { toast } from 'react-hot-toast';
import { Gender } from '../../types';

const MemberForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [member, setMember] = useState({
    memberId: '',
    name: '',
    dateOfBirth: '',
    email: '',
    gender: 'MALE', // Default to MALE
    contact: '',
    address: '',
    doj: '',
    mentorId: '',
    password: '12345678', // Set a default password for new members
    isActive: true // default active
  });

  useEffect(() => {
    if (id) loadMember();
  }, [id]);

  const loadMember = async () => {
    try {
      setLoading(true);
      const data = await memberService.getMemberById(id);

      setMember({
        memberId: data.memberId || '',
        name: data.name || '',
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
        email: data.email || '',
        gender: data.gender || '',
        contact: data.contact ? Number(data.contact) : '',
        address: data.address || '',
        doj: data.doj ? new Date(data.doj).toISOString().split('T')[0] : '',
        mentorId: data.mentorId || '',
        password: '',
        isActive: data.isActive ?? true
      });
    } catch (err) {
      console.error('Error loading member:', err);
      toast.error('Failed to load member');
      navigate('/members');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert memberId and contact to numbers if they are not empty
    if (name === 'memberId' || name === 'contact') {
      setMember((prev) => ({
        ...prev,
        [name]: value ? Number(value) : ''
      }));
    } else {
      setMember((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    
    // Validate required fields
    if (!member.name) {
      toast.error('Please enter a name');
      return;
    }
    
    if (!member.dateOfBirth) {
      toast.error('Please select a date of birth');
      return;
    }
    
    if (!member.gender) {
      toast.error('Please select a gender');
      return;
    }
    
    if (!member.contact) {
      toast.error('Please enter a contact number');
      return;
    }
    
    // Validate contact number is a positive number
    if (isNaN(member.contact) || member.contact <= 0) {
      toast.error('Please enter a valid contact number');
      return;
    }
    
    // Validate contact number length (assuming phone numbers should be reasonable length)
    if (member.contact.toString().length < 7 || member.contact.toString().length > 15) {
      toast.error('Contact number should be between 7 and 15 digits');
      return;
    }
    
    if (!member.address) {
      toast.error('Please enter an address');
      return;
    }
    
    if (!member.doj) {
      toast.error('Please select a date of joining');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!member.email || !emailRegex.test(member.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Validate password for new members
    if (!id && (!member.password || member.password.length < 8)) {
      setError('Password is required and must be at least 8 characters long');
      return;
    }
    
    // Validate password for existing members if provided
    if (id && member.password && member.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);

    try {
      const memberData = { ...member };
      
      if (id) {
        // For existing members, handle password change separately
        const passwordChanged = member.password && member.password.length > 0;
        
        // Remove password from memberData if it's empty (no change)
        if (!passwordChanged) {
          delete memberData.password;
        }
        
        // Update member data
        await memberService.updateMember(id, memberData);
        
        // If password was provided, change it separately
        if (passwordChanged) {
          try {
            await memberService.changePassword(id, {
              newPassword: member.password
            });
            toast.success('Member updated and password changed successfully');
          } catch (passwordError) {
            console.error('Password change failed:', passwordError);
            toast.error('Member updated but password change failed: ' + (passwordError.response?.data?.message || 'Password change error'));
          }
        } else {
          toast.success('Member updated successfully');
        }
        
        navigate('/members');
      } else {
        // For new members
        if (!memberData.password) {
          memberData.password = '12345678'; // Ensure there's always a password
        }
        
        try {
          const saved = await memberService.addMember(memberData);
          toast.success(`Member added successfully! Assigned ID: ${saved.memberId}`);
          navigate('/members');
        } catch (addError) {
          // Handle duplicate member error specifically
          if (addError.response?.status === 400 && addError.response?.data?.message?.includes('already exists')) {
            setError('A member with this email already exists. Please use a different email address.');
          } else {
            throw addError; // Re-throw to be caught by outer catch
          }
        }
      }
    } catch (err) {
      console.error('Error saving member:', err);
      if (!error) { // Only show generic error if we haven't set a specific one
        toast.error(err.response?.data?.message || 'An error occurred while saving member');
      }
    } finally {
      setLoading(false);
    }
  };


  if (loading && id) return <div className="text-center py-8">Loading member data...</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{id ? 'Edit' : 'Add'} Member</h2>
        {id && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <select
              value={member.isActive ? 'active' : 'inactive'}
              onChange={(e) => setMember({...member, isActive: e.target.value === 'active'})}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                member.isActive 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              } focus:outline-none focus:ring-1 focus:ring-offset-1 ${
                member.isActive ? 'focus:ring-green-500' : 'focus:ring-red-500'
              }`}
            >
              <option value="active" className="bg-white text-green-800">Active</option>
              <option value="inactive" className="bg-white text-red-800">Inactive</option>
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Member ID - Read Only */}
          <div>
            <label htmlFor="memberId" className="block text-sm font-medium text-gray-700">Member ID</label>
            <input
              type="number"
              id="memberId"
              name="memberId"
              value={member.memberId}
              readOnly
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100 text-gray-500 cursor-not-allowed"
              placeholder="Auto-generated ID"
            />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={member.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={member.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth *</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={member.dateOfBirth}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender *</label>
            <select
              id="gender"
              name="gender"
              value={member.gender}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Gender</option>
              {Object.entries(Gender).map(([key, value]) => (
                <option key={value} value={value}>{key}</option>
              ))}
            </select>
          </div>

          {/* Contact */}
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact *</label>
            <input
              type="tel"
              id="contact"
              name="contact"
              value={member.contact}
              onChange={handleChange}
              required
              placeholder="Enter phone number"
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">Enter a valid phone number (7-15 digits)</p>
          </div>

          {/* Date of Joining */}
          <div>
            <label htmlFor="doj" className="block text-sm font-medium text-gray-700">Date of Joining *</label>
            <input
              type="date"
              id="doj"
              name="doj"
              value={member.doj}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Mentor ID */}
          <div>
            <label htmlFor="mentorId" className="block text-sm font-medium text-gray-700">Mentor ID</label>
            <input
              type="text"
              id="mentorId"
              name="mentorId"
              value={member.mentorId}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address *</label>
            <textarea
              id="address"
              name="address"
              rows="3"
              value={member.address}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Password field */}
          {id ? (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password (leave blank to keep current)</label>
              <input
                type="password"
                id="password"
                name="password"
                value={member.password}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter new password"
              />
              <p className="mt-1 text-sm text-gray-500">Only enter a password if you want to change it</p>
            </div>
          ) : (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={member.password}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/members')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : id ? 'Update Member' : 'Add Member'}
          </button>
        </div>
      </form>

    </div>
  );
};

export default MemberForm;
