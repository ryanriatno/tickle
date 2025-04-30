"use client"

import type React from "react"

import { useState } from "react"
import { updateSettings } from "@/app/actions/settings"
import type { Tables } from "@/lib/types/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface SettingsFormProps {
  settings: Tables<"settings">
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const { toast } = useToast()
  const [pomodoroDuration, setPomodoroDuration] = useState(settings.pomodoro_duration)
  const [shortBreakDuration, setShortBreakDuration] = useState(settings.short_break_duration)
  const [longBreakDuration, setLongBreakDuration] = useState(settings.long_break_duration)
  const [longBreakInterval, setLongBreakInterval] = useState(settings.long_break_interval)
  const [soundEnabled, setSoundEnabled] = useState(settings.sound_enabled)
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notifications_enabled)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateSettings(settings.user_id, {
        pomodoro_duration: pomodoroDuration,
        short_break_duration: shortBreakDuration,
        long_break_duration: longBreakDuration,
        long_break_interval: longBreakInterval,
        sound_enabled: soundEnabled,
        notifications_enabled: notificationsEnabled,
      })

      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      })
    } catch (error) {
      console.error("Failed to update settings:", error)
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Request notification permission if enabled
  const handleNotificationToggle = async (checked: boolean) => {
    setNotificationsEnabled(checked)

    if (checked && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        await Notification.requestPermission()
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Timer Settings</CardTitle>
          <CardDescription>Customize your Pomodoro timer durations and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pomodoro">Pomodoro Duration (minutes)</Label>
              <Input
                id="pomodoro"
                type="number"
                min={1}
                max={60}
                value={pomodoroDuration}
                onChange={(e) => setPomodoroDuration(Number.parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortBreak">Short Break Duration (minutes)</Label>
              <Input
                id="shortBreak"
                type="number"
                min={1}
                max={30}
                value={shortBreakDuration}
                onChange={(e) => setShortBreakDuration(Number.parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longBreak">Long Break Duration (minutes)</Label>
              <Input
                id="longBreak"
                type="number"
                min={1}
                max={60}
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(Number.parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longBreakInterval">Long Break Interval (pomodoros)</Label>
              <Input
                id="longBreakInterval"
                type="number"
                min={1}
                max={10}
                value={longBreakInterval}
                onChange={(e) => setLongBreakInterval(Number.parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sound">Sound Alerts</Label>
              <Switch id="sound" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Desktop Notifications</Label>
              <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={handleNotificationToggle} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
