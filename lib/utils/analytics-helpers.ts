import type { Tables } from "@/lib/types/database.types"

export interface DailyStats {
  date: string
  completedPomodoros: number
  completedTasks: number
}

export interface TaskCategoryStats {
  category: string
  count: number
}

// Function to extract daily statistics from tasks
export function getDailyStats(tasks: Tables<"tasks">[], days = 7): DailyStats[] {
  const stats: DailyStats[] = []
  const today = new Date()

  // Create an array of the last 'days' days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateString = date.toISOString().split("T")[0]

    stats.push({
      date: dateString,
      completedPomodoros: 0,
      completedTasks: 0,
    })
  }

  // Process tasks to populate statistics
  tasks.forEach((task) => {
    const updatedDate = new Date(task.updated_at).toISOString().split("T")[0]
    const statIndex = stats.findIndex((stat) => stat.date === updatedDate)

    if (statIndex !== -1) {
      stats[statIndex].completedPomodoros += task.completed_pomodoros
      if (task.completed) {
        stats[statIndex].completedTasks += 1
      }
    }
  })

  return stats
}

// Function to calculate productivity score based on completed pomodoros and tasks
export function calculateProductivityScore(tasks: Tables<"tasks">[]): number {
  const totalCompletedPomodoros = tasks.reduce((sum, task) => sum + task.completed_pomodoros, 0)
  const totalPlannedPomodoros = tasks.reduce((sum, task) => sum + task.total_pomodoros, 0)
  const completedTasks = tasks.filter((task) => task.completed).length

  // Simple productivity score calculation
  if (totalPlannedPomodoros === 0) return 0

  const pomodoroCompletion = totalCompletedPomodoros / totalPlannedPomodoros
  const taskCompletion = completedTasks / tasks.length

  return Math.round((pomodoroCompletion * 0.7 + taskCompletion * 0.3) * 100)
}

// Function to extract task categories (using first word of title as a simple categorization)
export function getTaskCategories(tasks: Tables<"tasks">[]): TaskCategoryStats[] {
  const categories: Record<string, number> = {}

  tasks.forEach((task) => {
    // Simple categorization using first word of title
    const firstWord = task.title.split(" ")[0].toLowerCase()
    if (firstWord.length > 3) {
      // Ignore short words like "the", "and", etc.
      categories[firstWord] = (categories[firstWord] || 0) + 1
    }
  })

  return Object.entries(categories)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // Top 5 categories
}
