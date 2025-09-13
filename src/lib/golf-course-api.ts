interface GolfCourseAPILocation {
  address: string
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
}

interface GolfCourseAPITeeBox {
  tee_name: string
  course_rating: number
  slope_rating: number
  bogey_rating: number
  total_yards: number
  total_meters: number
  number_of_holes: number
  par_total: number
  front_course_rating: number
  front_slope_rating: number
  front_bogey_rating: number
  back_course_rating: number
  back_slope_rating: number
  back_bogey_rating: number
  holes: Array<{
    par: number
    yardage: number
    handicap: number
  }>
}

interface GolfCourseAPICourse {
  id: number
  club_name: string
  course_name: string
  location: GolfCourseAPILocation
  tees: {
    female: GolfCourseAPITeeBox[]
    male: GolfCourseAPITeeBox[]
  }
}

interface GolfCourseAPISearchResponse {
  courses: GolfCourseAPICourse[]
}

class GolfCourseAPIClient {
  private apiKey: string
  private baseUrl = 'https://api.golfcourseapi.com'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'GreensWeveSeen/1.0'
        },
        signal: controller.signal
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Golf Course API: Invalid or missing API key')
        }
        if (response.status === 429) {
          throw new Error('Golf Course API: Rate limit exceeded')
        }
        throw new Error(`Golf Course API error: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async searchCourses(query: string): Promise<GolfCourseAPICourse[]> {
    try {
      // Multiple search strategies to find more courses
      const searchQueries = [
        query, // Original query
        `${query} golf course`, // Add golf course to query
        `${query} country club`, // Add country club to query
      ]

      const allResults: GolfCourseAPICourse[] = []
      const seenIds = new Set<number>()

      for (const searchQuery of searchQueries) {
        try {
          const response = await this.makeRequest<GolfCourseAPISearchResponse>(
            `/v1/search?search_query=${encodeURIComponent(searchQuery)}&limit=20`
          )

          const newCourses = (response.courses || []).filter(course => {
            if (seenIds.has(course.id)) return false
            seenIds.add(course.id)
            return true
          })

          allResults.push(...newCourses)

          // Stop searching if we have enough results
          if (allResults.length >= 15) break
        } catch (error) {
          console.warn(`Search failed for query "${searchQuery}":`, error)
          continue
        }
      }

      return allResults.slice(0, 20) // Return max 20 results
    } catch (error) {
      console.error('Golf Course API search error:', error)
      return []
    }
  }

  async getCourseById(id: number): Promise<GolfCourseAPICourse | null> {
    try {
      return await this.makeRequest<GolfCourseAPICourse>(`/v1/courses/${id}`)
    } catch (error) {
      console.error('Golf Course API get course error:', error)
      return null
    }
  }

  async searchByLocation(latitude: number, longitude: number, radius: number = 25): Promise<GolfCourseAPICourse[]> {
    try {
      const response = await this.makeRequest<GolfCourseAPISearchResponse>(
        `/v1/search?lat=${latitude}&lng=${longitude}&radius=${radius}&limit=25`
      )
      return response.courses || []
    } catch (error) {
      console.error('Golf Course API location search error:', error)
      return []
    }
  }

  async searchByState(state: string): Promise<GolfCourseAPICourse[]> {
    try {
      const response = await this.makeRequest<GolfCourseAPISearchResponse>(
        `/v1/search?state=${encodeURIComponent(state)}&limit=30`
      )
      return response.courses || []
    } catch (error) {
      console.error('Golf Course API state search error:', error)
      return []
    }
  }

  // Convert API course to our local course format
  convertToLocalCourse(apiCourse: GolfCourseAPICourse) {
    // Use the main tee box (typically men's regular tees) for par calculation
    const mainTeeBox = apiCourse.tees.male?.[0] || apiCourse.tees.female?.[0]
    const par = mainTeeBox?.par_total || 72

    return {
      name: apiCourse.course_name || apiCourse.club_name,
      location: `${apiCourse.location.city}, ${apiCourse.location.state}`,
      par,
      externalId: apiCourse.id.toString(),
      externalSource: 'golfcourseapi',
      latitude: apiCourse.location.latitude,
      longitude: apiCourse.location.longitude,
      address: apiCourse.location.address,
      teeBoxes: [
        ...apiCourse.tees.male.map(tee => ({
          name: tee.tee_name,
          gender: 'male' as const,
          courseRating: tee.course_rating,
          slopeRating: tee.slope_rating,
          totalYards: tee.total_yards,
          par: tee.par_total
        })),
        ...apiCourse.tees.female.map(tee => ({
          name: tee.tee_name,
          gender: 'female' as const,
          courseRating: tee.course_rating,
          slopeRating: tee.slope_rating,
          totalYards: tee.total_yards,
          par: tee.par_total
        }))
      ]
    }
  }
}

// Singleton instance
let golfCourseAPIClient: GolfCourseAPIClient | null = null

export function getGolfCourseAPIClient(): GolfCourseAPIClient | null {
  if (!process.env.GOLF_COURSE_API_KEY) {
    console.warn('GOLF_COURSE_API_KEY not configured')
    return null
  }

  if (!golfCourseAPIClient) {
    golfCourseAPIClient = new GolfCourseAPIClient(process.env.GOLF_COURSE_API_KEY)
  }

  return golfCourseAPIClient
}

export type { GolfCourseAPICourse, GolfCourseAPISearchResponse }
