'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const data = [
  { time: '08:00', value: 35, color: '#93C5FD' }, // blue-200
  { time: '10:00', value: 48, color: '#60A5FA' }, // blue-300
  { time: '12:00', value: 32, color: '#93C5FD' }, // blue-200
  { time: '14:00', value: 62, color: '#2563EB' }, // blue-500
  { time: '16:00', value: 28, color: '#F87171' }, // red-400
  { time: '18:00', value: 58, color: '#60A5FA' }, // blue-300
  { time: '20:00', value: 72, color: '#FBBF24' }, // yellow-400
  { time: '22:00', value: 45, color: '#60A5FA' }, // blue-300
]

export function HealthRiskChart() {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="text-xs text-gray-600 font-semibold tracking-wide mb-4">
        XU HƯỚNG: ỔN ĐỊNH HIỆU SUẤT
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            domain={[0, 80]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number) => [value, 'Hiệu suất']}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
