"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DailyStats } from "@/lib/utils/analytics-helpers"

interface ProductivityChartProps {
  dailyStats: DailyStats[]
}

export function ProductivityChart({ dailyStats }: ProductivityChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Chart dimensions
    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Find max values for scaling
    const maxPomodoros = Math.max(...dailyStats.map((stat) => stat.completedPomodoros), 5)
    const maxTasks = Math.max(...dailyStats.map((stat) => stat.completedTasks), 3)

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = "#94a3b8" // slate-400
    ctx.lineWidth = 1
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Draw pomodoro bars
    const barWidth = chartWidth / (dailyStats.length * 2)
    dailyStats.forEach((stat, index) => {
      const x = padding + index * (chartWidth / dailyStats.length) + barWidth / 2
      const pomodoroHeight = (stat.completedPomodoros / maxPomodoros) * chartHeight
      const taskHeight = (stat.completedTasks / maxTasks) * chartHeight

      // Pomodoro bar
      ctx.fillStyle = "#f43f5e" // rose-500
      ctx.fillRect(x, height - padding - pomodoroHeight, barWidth, pomodoroHeight)

      // Task bar
      ctx.fillStyle = "#3b82f6" // blue-500
      ctx.fillRect(x + barWidth, height - padding - taskHeight, barWidth, taskHeight)

      // Date label
      ctx.fillStyle = "#64748b" // slate-500
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      const date = new Date(stat.date)
      const dateLabel = date.toLocaleDateString(undefined, { weekday: "short" })
      ctx.fillText(dateLabel, x + barWidth / 2, height - padding + 15)
    })

    // Legend
    ctx.fillStyle = "#f43f5e" // rose-500
    ctx.fillRect(width - padding - 100, padding, 10, 10)
    ctx.fillStyle = "#3b82f6" // blue-500
    ctx.fillRect(width - padding - 100, padding + 20, 10, 10)

    ctx.fillStyle = "#64748b" // slate-500
    ctx.textAlign = "left"
    ctx.fillText("Pomodoros", width - padding - 85, padding + 9)
    ctx.fillText("Tasks", width - padding - 85, padding + 29)
  }, [dailyStats])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Productivity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full aspect-[2/1]">
          <canvas ref={canvasRef} width={500} height={250} className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  )
}
