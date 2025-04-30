"use client"

import type React from "react"

import { useState } from "react"
import { createTask, updateTask } from "@/app/actions/tasks"
import type { Tables } from "@/lib/types/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

interface TaskFormProps {
  userId: string
  onClose: () => void
  editTask?: Tables<"tasks"> | null
}

export function TaskForm({ userId, onClose, editTask }: TaskFormProps) {
  const [title, setTitle] = useState(editTask?.title || "")
  const [description, setDescription] = useState(editTask?.description || "")
  const [totalPomodoros, setTotalPomodoros] = useState(editTask?.total_pomodoros || 1)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (editTask) {
        await updateTask(editTask.id, {
          title,
          description,
          total_pomodoros: totalPomodoros,
          updated_at: new Date().toISOString(),
        })
      } else {
        await createTask({
          user_id: userId,
          title,
          description,
          total_pomodoros: totalPomodoros,
        })
      }
      onClose()
    } catch (error) {
      console.error("Failed to save task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{editTask ? "Edit Task" : "New Task"}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description || ""}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pomodoros">Number of Pomodoros</Label>
            <Input
              id="pomodoros"
              type="number"
              min={1}
              max={20}
              value={totalPomodoros}
              onChange={(e) => setTotalPomodoros(Number.parseInt(e.target.value))}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : editTask ? "Update" : "Create"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
