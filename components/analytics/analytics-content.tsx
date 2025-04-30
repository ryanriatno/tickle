"use client"

import type { Tables } from "@/lib/types/database.types"
import { getDailyStats, calculateProductivityScore, getTaskCategories } from "@/lib/utils/analytics-helpers"
import { ProductivityChart } from "./productivity-chart"
import { ProductivityScore } from "./productivity-score"
import { CategoryBreakdown } from "./category-breakdown"

interface AnalyticsContentProps {
  tasks: Tables<"tasks">[]
}

export function AnalyticsContent({ tasks }: AnalyticsContentProps) {
  const dailyStats = getDailyStats(tasks)
  const productivityScore = calculateProductivityScore(tasks)
  const categories = getTaskCategories(tasks)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <p className="text-muted-foreground">Track your productivity and task completion over time.</p>

      <div className="grid gap-6 md:grid-cols-2">
        <ProductivityScore score={productivityScore} />
        <CategoryBreakdown categories={categories} />
      </div>

      <ProductivityChart dailyStats={dailyStats} />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Summary</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{tasks.reduce((sum, task) => sum + task.completed_pomodoros, 0)}</div>
            <div className="text-sm text-muted-foreground">Total Pomodoros</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{tasks.filter((task) => task.completed).length}</div>
            <div className="text-sm text-muted-foreground">Completed Tasks</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{tasks.length}</div>
            <div className="text-sm text-muted-foreground">Total Tasks</div>
          </div>
        </div>
      </div>
    </div>
  )
}
