import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { memberService } from '../../services/memberService';
import { toast } from 'react-hot-toast';
import { ArrowLeft, User, Mail, Phone, Users, Calendar } from 'lucide-react';
import { Gender } from '../../types';

const MemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMember();
  }, [id]);

  const loadMember = async () => {
    try {
      setLoading(true);
      console.log('Loading member with ID:', id);
      const numericId = Number(id);
      if (isNaN(numericId)) {
        throw new Error('Invalid member ID');
      }
      console.log('Calling getMemberById with:', numericId);
      const data = await memberService.getMemberById(numericId);
      console.log('Member data received:', data);
      setMember(data);
    } catch (error) {
      console.error('Error loading member:', error);
      toast.error('Failed to load member details');
      navigate('/members');
    } finally {
      setLoading(false);
    }
  };

  const getGenderDisplay = (genderValue) => {
    return Object.keys(Gender).find(key => Gender[key] === genderValue) || 'Not specified';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center py-8">Loading member details...</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Member not found</p>
        <Link to="/members" className="text-indigo-600 hover:text-indigo-800">
          Back to Members
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/members')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Members
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Member ID: {member.memberId}</p>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/members/edit/${member.memberId}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Edit Member
            </Link>
          </div>
        </div>
      </div>

      {/* Member Details Card */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.name}</dd>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <a 
                    href={`mailto:${member.email}`}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    {member.email}
                  </a>
                </dd>
              </div>
            </div>

            {/* Contact */}
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {member.contact ? (
                    <a 
                      href={`tel:${member.contact}`}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      {member.contact}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </dd>
              </div>
            </div>

            {/* Gender */}
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Gender</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {getGenderDisplay(member.gender)}
                </dd>
              </div>
            </div>

            {/* Member Since */}
            {member.createdAt && (
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(member.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
                </div>
              </div>
            )}

            {/* Last Updated */}
            {member.updatedAt && (
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(member.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information Card */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Additional Information</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="text-sm text-gray-500">
            {/* You can add more member-specific information here */}
            <p>Member profile created and managed through the Toastmasters system.</p>
            {member.bio && (
              <div className="mt-4">
                <dt className="text-sm font-medium text-gray-500">Bio</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.bio}</dd>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;
