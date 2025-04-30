"use client"

import { useState } from "react"
import type { Tables } from "@/lib/types/database.types"
import { updateTask, deleteTask } from "@/app/actions/tasks"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash, Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskItemProps {
  task: Tables<"tasks">
  onEdit: () => void
  onSelect: () => void
  isSelected: boolean
}

export function TaskItem({ task, onEdit, onSelect, isSelected }: TaskItemProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleComplete = async () => {
    setIsLoading(true)
    try {
      await updateTask(task.id, {
        completed: !task.completed,
        updated_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Failed to update task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      setIsLoading(true)
      try {
        await deleteTask(task.id)
      } catch (error) {
        console.error("Failed to delete task:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border",
        isSelected && "border-primary bg-primary/5",
        !isSelected && "hover:bg-accent",
      )}
    >
      <div className="flex items-center space-x-3 flex-1">
        <Checkbox checked={task.completed} onCheckedChange={handleToggleComplete} disabled={isLoading} />
        <div className="flex flex-col">
          <span className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>
            {task.title}
          </span>
          {task.description && (
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{task.description}</span>
          )}
          <span className="text-xs text-muted-foreground">
            {task.completed_pomodoros} / {task.total_pomodoros} pomodoros
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={onSelect} disabled={task.completed} title="Work on this task">
          <Play className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
