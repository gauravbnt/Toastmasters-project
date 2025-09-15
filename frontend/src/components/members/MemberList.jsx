import React, { useState, useEffect } from 'react';
import { memberService } from '../../services/memberService';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Gender } from '../../types';
import { Eye, X, User, Mail, Phone, Calendar, Home, UserCheck, Hash, Search, CheckCircle, XCircle } from 'lucide-react';

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberDetail, setShowMemberDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await memberService.getAllMembers();
      // Sort members by date of joining (newest first)
      const sortedMembers = data.sort((a, b) => {
        const dateA = new Date(a.doj || a.createdAt || 0);
        const dateB = new Date(b.doj || b.createdAt || 0);
        return dateB - dateA;
      });
      setMembers(sortedMembers);
    } catch (err) {
      setError('Failed to load members');
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await memberService.deleteMember(id);
        toast.success('Member deleted successfully');
        loadMembers();
      } catch (err) {
        toast.error('Failed to delete member');
      }
    }
  };

  const handleViewMember = async (member) => {
    try {
      // Fetch detailed member information
      const memberDetails = await memberService.getMemberById(member.memberId);
      setSelectedMember(memberDetails);
      setShowMemberDetail(true);
    } catch (error) {
      console.error('Error fetching member details:', error);
      toast.error('Failed to load member details');
    }
  };

  const filterMembers = (members) => {
    if (!searchTerm.trim()) return members;
    
    return members.filter(member => 
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.contact?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.memberId?.toString().includes(searchTerm)
    );
  };

  if (loading) return <div className="text-center py-8">Loading members...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  const filteredMembers = filterMembers(members);

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Members ({filteredMembers.length}{searchTerm ? ` of ${members.length}` : ''})</h3>
        <Link
          to="add"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Member
        </Link>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search members by name, email, contact, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? 'No members match your search criteria' : 'No members found'}
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
              <tr key={member.memberId}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{member.name}</div>
                  <div className="text-sm text-gray-500">{member.memberId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.contact}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Object.keys(Gender).find(key => Gender[key] === member.gender)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    member.isActive ?? true 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {member.isActive ?? true ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {member.isActive ?? true ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleViewMember(member)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 rounded-md transition-colors duration-200"
                    title="View Member Details"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </button>
                  <Link
                    to={`edit/${member.memberId}`}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 hover:text-yellow-800 rounded-md transition-colors duration-200"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(member.memberId)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-800 rounded-md transition-colors duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Member Detail Modal */}
      {showMemberDetail && selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Member Details</h3>
              <button
                onClick={() => setShowMemberDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedMember.name}</h4>
                  <p className="text-gray-600">Member ID: {selectedMember.memberId}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Email:</span>
                    <span className="text-sm text-gray-900">{selectedMember.email || 'Not provided'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Contact:</span>
                    <span className="text-sm text-gray-900">{selectedMember.contact || 'Not provided'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Gender:</span>
                    <span className="text-sm text-gray-900">
                      {Object.keys(Gender).find(key => Gender[key] === selectedMember.gender) || 'Not specified'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {(selectedMember.isActive ?? true) ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className={`text-sm font-medium ${(selectedMember.isActive ?? true) ? 'text-green-700' : 'text-red-700'}`}>
                      {(selectedMember.isActive ?? true) ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Date of Birth:</span>
                    <span className="text-sm text-gray-900">
                      {selectedMember.dateOfBirth 
                        ? new Date(selectedMember.dateOfBirth).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Not provided'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Date of Joining:</span>
                    <span className="text-sm text-gray-900">
                      {selectedMember.doj 
                        ? new Date(selectedMember.doj).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Not available'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Mentor ID:</span>
                    <span className="text-sm text-gray-900">{selectedMember.mentorId || 'No mentor assigned'}</span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Home className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700">Address:</span>
                      <p className="text-sm text-gray-900 mt-1">{selectedMember.address || 'Not provided'}</p>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberList;
