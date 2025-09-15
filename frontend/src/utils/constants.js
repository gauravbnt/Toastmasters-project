// Note: MEMBER_ROLES is now deprecated - use dynamic roles from Role API
export const MEMBER_ROLES = [
  { value: 'Member', label: 'Member' },
  { value: 'Officer', label: 'Officer' },
  { value: 'President', label: 'President' },
  { value: 'Vice President', label: 'Vice President' },
  { value: 'Secretary', label: 'Secretary' },
  { value: 'Treasurer', label: 'Treasurer' }
]

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' }
]

export const MEETING_TYPES = [
  { value: 'REGULAR', label: 'Regular Meeting' },
  { value: 'CONTEST', label: 'Contest' },
  { value: 'SPECIAL', label: 'Special Meeting' }
]

export const AVAILABILITY_STATUS = [
  { value: 'Available', label: 'Available' },
  { value: 'Not Available', label: 'Not Available' }
]

export const API_ENDPOINTS = {
  MEMBERS: '/members',
  MEETINGS: '/meetings',
  AGENDA: '/agenda',
  AVAILABILITY: '/availability'
}

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50]
}
