'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MonthlyStatsData {
  month: string
  rounds: number
  totalScore: number
  averageScore: number
}

interface MonthlyStatsChartProps {
  data: MonthlyStatsData[]
}

export function MonthlyStatsChart({ data }: MonthlyStatsChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map(item => ({
    ...item,
    monthLabel: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="monthLabel" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  value,
                  name === 'rounds' ? 'Rounds Played' : 'Average Score'
                ]}
                labelFormatter={(value: string) => `Month: ${value}`}
              />
              <Bar 
                yAxisId="left"
                dataKey="rounds" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                name="rounds"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="averageScore" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name="averageScore"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-blue-600">Total Rounds</div>
            <div className="text-2xl font-bold">{data.reduce((sum, item) => sum + item.rounds, 0)}</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-red-600">Best Month Avg</div>
            <div className="text-2xl font-bold">
              {Math.min(...data.map(item => item.averageScore))}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-600">Most Active Month</div>
            <div className="text-2xl font-bold">
              {data.reduce((max, item) => item.rounds > max.rounds ? item : max, data[0]).rounds}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
