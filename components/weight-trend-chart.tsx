"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

type TrendDataPoint = {
  timestamp: number
  date: string
  weight: number
  uncertainty: number
  quality: number
}

type WeightTrendChartProps = {
  data: TrendDataPoint[]
}

export function WeightTrendChart({ data }: WeightTrendChartProps) {
  const [dateRange, setDateRange] = useState<{ start: number | null; end: number | null }>({
    start: null,
    end: null,
  })

  const filteredData = useMemo(() => {
    if (!dateRange.start && !dateRange.end) return data

    return data.filter((point) => {
      const timestamp = new Date(point.date).getTime()
      if (dateRange.start && timestamp < dateRange.start) return false
      if (dateRange.end && timestamp > dateRange.end) return false
      return true
    })
  }, [data, dateRange])

  const stats = useMemo(() => {
    if (filteredData.length === 0) return null

    const weights = filteredData.map((d) => d.weight)
    const min = Math.min(...weights)
    const max = Math.max(...weights)
    const avg = weights.reduce((sum, w) => sum + w, 0) / weights.length

    return { min, max, avg, count: filteredData.length }
  }, [filteredData])

  const setPresetRange = (days: number | null) => {
    if (days === null) {
      // All time
      setDateRange({ start: null, end: null })
    } else {
      const end = Date.now()
      const start = end - days * 24 * 60 * 60 * 1000
      setDateRange({ start, end })
    }
  }

  if (data.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="font-sans text-lg font-semibold tracking-tight">Algorithm Weight Trend</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tracking {stats?.count} measurements over time (weights &gt; 50 kg)
              </p>
            </div>
            {stats && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Min:</span>
                  <span className="font-medium">{stats.min.toFixed(2)} kg</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Max:</span>
                  <span className="font-medium">{stats.max.toFixed(2)} kg</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Avg:</span>
                  <span className="font-medium">{stats.avg.toFixed(2)} kg</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Time range:</span>
            <Button
              variant={!dateRange.start && !dateRange.end ? "default" : "outline"}
              size="sm"
              onClick={() => setPresetRange(null)}
            >
              All time
            </Button>
            <Button
              variant={
                dateRange.start && dateRange.end && dateRange.end - dateRange.start <= 7 * 24 * 60 * 60 * 1000
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => setPresetRange(7)}
            >
              Last 7 days
            </Button>
            <Button
              variant={
                dateRange.start &&
                dateRange.end &&
                dateRange.end - dateRange.start <= 30 * 24 * 60 * 60 * 1000 &&
                dateRange.end - dateRange.start > 7 * 24 * 60 * 60 * 1000
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => setPresetRange(30)}
            >
              Last 30 days
            </Button>
            <Button
              variant={
                dateRange.start &&
                dateRange.end &&
                dateRange.end - dateRange.start <= 90 * 24 * 60 * 60 * 1000 &&
                dateRange.end - dateRange.start > 30 * 24 * 60 * 60 * 1000
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => setPresetRange(90)}
            >
              Last 90 days
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
              }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              domain={["dataMin - 1", "dataMax + 1"]}
              label={{ value: "Weight (kg)", angle: -90, position: "insideLeft", style: { textAnchor: "middle" } }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null

                const data = payload[0].payload as TrendDataPoint
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-lg">
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium">
                        {new Date(data.date).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Weight:</span>
                          <span className="font-medium">{data.weight.toFixed(3)} kg</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Uncertainty:</span>
                          <span className="font-medium">±{data.uncertainty.toFixed(3)} kg</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Quality:</span>
                          <span className="font-medium">{(data.quality * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }}
            />
            {stats && <ReferenceLine y={stats.avg} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: "#3b82f6", fill: "#3b82f6" }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
