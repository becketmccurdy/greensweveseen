'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ScoreDistributionData {
  range: string
  count: number
  percentage: number
}

interface ScoreDistributionChartProps {
  data: ScoreDistributionData[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  if (data.length === 0 || data.every(item => item.count === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="range" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} rounds (${data.find(d => d.range === name)?.percentage || 0}%)`,
                  'Rounds'
                ]}
                labelFormatter={(value: string) => `Score Range: ${value}`}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
          {data.map((item, index) => (
            <div key={item.range} className="text-center">
              <div 
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="text-xs font-medium">{item.range}</div>
              <div className="text-xs text-gray-500">{item.count} rounds</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
