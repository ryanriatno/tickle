"use client"

import { useState, useEffect } from "react"
import { usePomodoro, type TimerMode } from "@/hooks/use-pomodoro"
import { formatTime } from "@/lib/utils/format-time"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Tables } from "@/lib/types/database.types"
import { incrementCompletedPomodoros } from "@/app/actions/tasks"
import { Play, Pause, RefreshCw } from "lucide-react"

interface TimerProps {
  settings: Tables<"settings">
  currentTask?: Tables<"tasks"> | null
}

export function Timer({ settings, currentTask }: TimerProps) {
  const [requestedNotificationPermission, setRequestedNotificationPermission] = useState(false)

  const pomodoroSettings = {
    pomodoroDuration: settings.pomodoro_duration,
    shortBreakDuration: settings.short_break_duration,
    longBreakDuration: settings.long_break_duration,
    longBreakInterval: settings.long_break_interval,
    soundEnabled: settings.sound_enabled,
    notificationsEnabled: settings.notifications_enabled,
  }

  const { mode, timeLeft, isActive, completedPomodoros, startTimer, pauseTimer, resetTimer, switchMode } =
    usePomodoro(pomodoroSettings)

  // Request notification permission if enabled
  useEffect(() => {
    if (
      settings.notifications_enabled &&
      !requestedNotificationPermission &&
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission()
      setRequestedNotificationPermission(true)
    }
  }, [settings.notifications_enabled, requestedNotificationPermission])

  // Update document title with timer
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${formatTime(timeLeft)} - Tickle`
    }

    return () => {
      if (typeof document !== "undefined") {
        document.title = "Tickle"
      }
    }
  }, [timeLeft])

  // Handle pomodoro completion
  useEffect(() => {
    const handlePomodoroComplete = async () => {
      if (mode === "shortBreak" || mode === "longBreak") {
        if (currentTask?.id) {
          try {
            await incrementCompletedPomodoros(currentTask.id)
          } catch (error) {
            console.error("Failed to increment pomodoro count:", error)
          }
        }
      }
    }

    handlePomodoroComplete()
  }, [mode, currentTask])

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-center">
          {currentTask ? (
            <div className="flex flex-col">
              <span className="text-lg">Working on:</span>
              <span className="text-xl font-bold truncate">{currentTask.title}</span>
              <span className="text-sm text-muted-foreground">
                {currentTask.completed_pomodoros} / {currentTask.total_pomodoros} pomodoros
              </span>
            </div>
          ) : (
            "Pomodoro Timer"
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="pomodoro"
          value={mode}
          onValueChange={(value) => switchMode(value as TimerMode)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
            <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
            <TabsTrigger value="longBreak">Long Break</TabsTrigger>
          </TabsList>

          <TabsContent value="pomodoro" className="mt-0">
            <div className="flex flex-col items-center">
              <div className="text-6xl font-bold my-8">{formatTime(timeLeft)}</div>
              <div className="flex space-x-4">
                {!isActive ? (
                  <Button onClick={startTimer} size="lg">
                    <Play className="mr-2 h-4 w-4" /> Start
                  </Button>
                ) : (
                  <Button onClick={pauseTimer} size="lg" variant="secondary">
                    <Pause className="mr-2 h-4 w-4" /> Pause
                  </Button>
                )}
                <Button onClick={resetTimer} size="lg" variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">Completed Pomodoros: {completedPomodoros}</div>
            </div>
          </TabsContent>

          <TabsContent value="shortBreak" className="mt-0">
            <div className="flex flex-col items-center">
              <div className="text-6xl font-bold my-8">{formatTime(timeLeft)}</div>
              <div className="flex space-x-4">
                {!isActive ? (
                  <Button onClick={startTimer} size="lg">
                    <Play className="mr-2 h-4 w-4" /> Start
                  </Button>
                ) : (
                  <Button onClick={pauseTimer} size="lg" variant="secondary">
                    <Pause className="mr-2 h-4 w-4" /> Pause
                  </Button>
                )}
                <Button onClick={resetTimer} size="lg" variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
              <div className="mt-4 text-center text-muted-foreground">Take a short break!</div>
            </div>
          </TabsContent>

          <TabsContent value="longBreak" className="mt-0">
            <div className="flex flex-col items-center">
              <div className="text-6xl font-bold my-8">{formatTime(timeLeft)}</div>
              <div className="flex space-x-4">
                {!isActive ? (
                  <Button onClick={startTimer} size="lg">
                    <Play className="mr-2 h-4 w-4" /> Start
                  </Button>
                ) : (
                  <Button onClick={pauseTimer} size="lg" variant="secondary">
                    <Pause className="mr-2 h-4 w-4" /> Pause
                  </Button>
                )}
                <Button onClick={resetTimer} size="lg" variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
              <div className="mt-4 text-center text-muted-foreground">Take a long break! You've earned it.</div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
