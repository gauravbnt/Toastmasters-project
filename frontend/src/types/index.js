// Member Types
export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER'
}

export const MeetingType = {
  REGULAR: 'REGULAR',
  CONTEST: 'CONTEST',
  SPECIAL: 'SPECIAL',
}

// Availability Status enum (matches Spring Boot enum)
export const AvailabilityStatus = {
  AVAILABLE: 'AVAILABLE',
  NOT_AVAILABLE: 'NOT_AVAILABLE',
  MAYBE: 'MAYBE',
}

// Member Request/Response interfaces (matching your Spring Boot DTOs)
export const createMemberRequest = (data) => ({
  memberId: data.memberId,
  name: data.name,
  age: data.age,
  email: data.email,
  address: data.address,
  contact: data.contact,
  doj: data.doj, // Date of joining
  gender: data.gender, // Gender enum
  password: data.password,
  mentorId: data.mentorId || null
})

// Meeting Request/Response interfaces
export const createMeetingRequest = (data) => ({
  meetingId: Number(data.meetingId),
  meetingTitle: data.meetingTitle,
  meetingType: data.meetingType, // MeetingType enum
  date: data.date, // LocalDate format: YYYY-MM-DD
  startTime: data.startTime, // LocalTime format: HH:MM:SS
  endTime: data.endTime, // LocalTime format: HH:MM:SS
  location: data.location,
  // Add any other fields that might be needed for the meeting
  roles: data.roles || [] // Ensure roles are included if present
})

// Role Request/Response interfaces
export const createRoleRequest = (data) => ({
  roleId: data.roleId,
  roleName: data.roleName,
  roleDescription: data.roleDescription
})

// Validation helpers
export const validateMember = (memberData) => {
  const errors = {}
  
  if (!memberData.memberId) errors.memberId = 'Member ID is required'
  if (!memberData.name) errors.name = 'Name is required'
  if (!memberData.age || memberData.age < 1) errors.age = 'Valid age is required'
  if (!memberData.email) errors.email = 'Email is required'
  if (!memberData.address) errors.address = 'Address is required'
  if (!memberData.contact) errors.contact = 'Contact number is required'
  if (!memberData.doj) errors.doj = 'Date of joining is required'
  if (!memberData.gender) errors.gender = 'Gender is required'
  if (!memberData.password) errors.password = 'Password is required'
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateMeeting = (meetingData) => {
  const errors = {}
  
  if (!meetingData.meetingId && meetingData.meetingId !== 0) {
    errors.meetingId = 'Meeting ID is required'
  } else if (isNaN(Number(meetingData.meetingId))) {
    errors.meetingId = 'Meeting ID must be a number'
  }
  
  if (!meetingData.meetingTitle?.trim()) errors.meetingTitle = 'Meeting title is required'
  if (!meetingData.meetingType) errors.meetingType = 'Meeting type is required'
  if (!meetingData.date) errors.date = 'Date is required'
  if (!meetingData.startTime) errors.startTime = 'Start time is required'
  if (!meetingData.endTime) errors.endTime = 'End time is required'
  if (!meetingData.location?.trim()) errors.location = 'Location is required'
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateRole = (roleData) => {
  const errors = {}
  
  if (!roleData.roleId) errors.roleId = 'Role ID is required'
  if (!roleData.roleName) errors.roleName = 'Role name is required'
  if (!roleData.roleDescription) errors.roleDescription = 'Role description is required'
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
