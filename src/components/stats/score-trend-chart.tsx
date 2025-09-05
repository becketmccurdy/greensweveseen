'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ScoreTrendData {
  date: string
  score: number
  par: number
  course: string
  toPar: number
}

interface ScoreTrendChartProps {
  data: ScoreTrendData[]
  period: string
}

export function ScoreTrendChart({ data, period }: ScoreTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            No data available for the selected period
          </div>
        </CardContent>
      </Card>
    )
  }

  const averageScore = Math.round(data.reduce((sum, item) => sum + item.score, 0) / data.length)
  const averagePar = Math.round(data.reduce((sum, item) => sum + item.par, 0) / data.length)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Trend ({period})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
              />
              <YAxis 
                domain={['dataMin - 5', 'dataMax + 5']}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  value,
                  name === 'score' ? 'Score' : name === 'par' ? 'Par' : 'To Par'
                ]}
                labelFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString()
                }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-medium">{data.course}</p>
                        <p className="text-sm text-gray-600">{new Date(label).toLocaleDateString()}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Score:</span> {data.score}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Par:</span> {data.par}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">To Par:</span> 
                            <span className={data.toPar > 0 ? 'text-red-600' : data.toPar < 0 ? 'text-green-600' : 'text-gray-600'}>
                              {data.toPar > 0 ? '+' : ''}{data.toPar}
                            </span>
                          </p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <ReferenceLine y={averagePar} stroke="#6b7280" strokeDasharray="2 2" />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="par"
                stroke="#6b7280"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <div>
            <span className="font-medium">Average Score:</span> {averageScore}
          </div>
          <div>
            <span className="font-medium">Average Par:</span> {averagePar}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
