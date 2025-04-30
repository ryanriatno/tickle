"use client"

import { useState } from "react"
import type { Tables } from "@/lib/types/database.types"
import { Timer } from "@/components/pomodoro/timer"
import { TaskList } from "@/components/tasks/task-list"

interface DashboardContentProps {
  tasks: Tables<"tasks">[]
  settings: Tables<"settings">
}

export function DashboardContent({ tasks, settings }: DashboardContentProps) {
  const [selectedTask, setSelectedTask] = useState<Tables<"tasks"> | null>(null)

  const handleSelectTask = (task: Tables<"tasks">) => {
    setSelectedTask(task)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Timer settings={settings} currentTask={selectedTask} />
        </div>
        <div>
          <TaskList
            tasks={tasks}
            userId={settings.user_id}
            onSelectTask={handleSelectTask}
            selectedTaskId={selectedTask?.id}
          />
        </div>
      </div>
    </div>
  )
}
