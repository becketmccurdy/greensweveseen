import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Plus, Search } from 'lucide-react'

export function CoursesEmpty() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <MapPin className="h-8 w-8 text-gray-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">No courses found</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        We couldn&apos;t find any courses matching your search. Try adjusting your filters or search terms.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" asChild>
          <Link href="/rounds/new" prefetch={true}>
            <Plus className="h-5 w-5 mr-2" />
            Create & Record Round
          </Link>
        </Button>
        <Button variant="outline" size="lg">
          <Search className="h-5 w-5 mr-2" />
          Clear Filters
        </Button>
      </div>
    </div>
  )
}

export function CoursesInitialEmpty() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <MapPin className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Discover Golf Courses</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Search thousands of golf courses worldwide. Find courses near you or explore new destinations.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg">
          <Search className="h-5 w-5 mr-2" />
          Search Courses
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/rounds/new" prefetch={true}>
            <Plus className="h-5 w-5 mr-2" />
            Record a Round
          </Link>
        </Button>
      </div>
      
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-left">Popular Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Location-based Search</h4>
                <p className="text-sm text-gray-600">Find courses within any distance</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Interactive Map View</h4>
                <p className="text-sm text-gray-600">Visualize courses on a map</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Course Details</h4>
                <p className="text-sm text-gray-600">Par, rating, slope, and more</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Quick Round Recording</h4>
                <p className="text-sm text-gray-600">Start tracking immediately</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}