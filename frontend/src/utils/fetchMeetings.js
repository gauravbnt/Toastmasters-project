import { meetingService } from '../services/meetingService'

/**
 * Fetch all meetings data from the meeting API
 * @returns {Promise<Array>} Array of all meetings
 */
export const fetchAllMeetings = async () => {
  try {
    console.log('Fetching all meetings from API...')
    const meetings = await meetingService.getAllMeetings()
    console.log('Successfully fetched meetings:', meetings)
    return meetings
  } catch (error) {
    console.error('Error fetching meetings:', error)
    throw error
  }
}

/**
 * Fetch and log all meetings data (for debugging/testing)
 */
export const fetchAndLogAllMeetings = async () => {
  try {
    const meetings = await fetchAllMeetings()
    console.log('=== ALL MEETINGS DATA ===')
    console.log(`Total meetings: ${meetings.length}`)
    console.log('Meetings:', JSON.stringify(meetings, null, 2))
    console.log('=== END MEETINGS DATA ===')
    return meetings
  } catch (error) {
    console.error('Failed to fetch and log meetings:', error)
    throw error
  }
}

/**
 * Example usage in a React component
 */
export const useAllMeetings = () => {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadMeetings = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchAllMeetings()
      setMeetings(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch meetings')
      console.error('Error loading meetings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMeetings()
  }, [])

  return { meetings, loading, error, refetch: loadMeetings }
}
