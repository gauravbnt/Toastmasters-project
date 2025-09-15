export const formatMemberData = (memberData) => {
  if (!memberData) return [];
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return [
    { label: 'Full Name', value: memberData.name, icon: 'User' },
    { label: 'Email', value: memberData.email, icon: 'Mail' },
    { label: 'Phone', value: memberData.phone || 'Not provided', icon: 'Phone' },
    { label: 'Address', value: memberData.address || 'Not provided', icon: 'MapPin' },
    { label: 'Date of Birth', value: formatDate(memberData.dob), icon: 'Calendar' },
    { label: 'Member Since', value: formatDate(memberData.createdAt), icon: 'Calendar' },
    { label: 'Status', value: memberData.status || 'Active', icon: 'UserCheck' },
    { label: 'Last Login', value: formatDate(memberData.lastLogin) || 'Never', icon: 'Clock' },
  ];
};

export const getMemberStats = (roleStats, upcomingRoles) => {
  return [
    {
      label: 'Total Roles',
      value: roleStats?.totalRoles || 0,
      description: 'Total roles assigned',
      icon: 'Award',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      label: 'Upcoming Roles',
      value: upcomingRoles?.length || 0,
      description: 'Scheduled roles',
      icon: 'Calendar',
      color: 'bg-green-100 text-green-800'
    },
    {
      label: 'Completion Rate',
      value: roleStats?.completionRate ? `${roleStats.completionRate}%` : 'N/A',
      description: 'Role completion rate',
      icon: 'BarChart3',
      color: 'bg-purple-100 text-purple-800'
    }
  ];
};
