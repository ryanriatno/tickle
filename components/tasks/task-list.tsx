"use client"

import { useState } from "react"
import type { Tables } from "@/lib/types/database.types"
import { TaskItem } from "./task-item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TaskForm } from "./task-form"

interface TaskListProps {
  tasks: Tables<"tasks">[]
  userId: string
  onSelectTask: (task: Tables<"tasks">) => void
  selectedTaskId?: string
}

export function TaskList({ tasks, userId, onSelectTask, selectedTaskId }: TaskListProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Tables<"tasks"> | null>(null)

  const handleEdit = (task: Tables<"tasks">) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  const incompleteTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Tasks</CardTitle>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </CardHeader>
      <CardContent>
        {showForm && <TaskForm userId={userId} onClose={handleFormClose} editTask={editingTask} />}

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">In Progress</h3>
            {incompleteTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks in progress</p>
            ) : (
              <div className="space-y-2">
                {incompleteTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={() => handleEdit(task)}
                    onSelect={() => onSelectTask(task)}
                    isSelected={selectedTaskId === task.id}
                  />
                ))}
              </div>
            )}
          </div>

          {completedTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Completed</h3>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={() => handleEdit(task)}
                    onSelect={() => onSelectTask(task)}
                    isSelected={selectedTaskId === task.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
