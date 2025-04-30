"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export type TimerMode = "pomodoro" | "shortBreak" | "longBreak"

interface PomodoroSettings {
  pomodoroDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  soundEnabled: boolean
  notificationsEnabled: boolean
}

export function usePomodoro(settings: PomodoroSettings) {
  const [mode, setMode] = useState<TimerMode>("pomodoro")
  const [timeLeft, setTimeLeft] = useState(settings.pomodoroDuration)
  const [isActive, setIsActive] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const intervalRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Initialize audio
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/bell.mp3")
    }

    return () => {
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current)
      }
    }
  }, [])

  const handleTimerComplete = useCallback(() => {
    setIsActive(false)

    if (intervalRef.current) {
      cancelAnimationFrame(intervalRef.current)
    }

    // Play sound if enabled
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch((error) => console.error("Error playing sound:", error))
    }

    // Show notification if enabled
    if (settings.notificationsEnabled && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Tickle Timer", {
          body: mode === "pomodoro" ? "Pomodoro completed! Take a break." : "Break time is over! Back to work.",
          icon: "/favicon.ico",
        })
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission()
      }
    }

    // Update completed pomodoros and switch modes
    if (mode === "pomodoro") {
      const newCompletedCount = completedPomodoros + 1
      setCompletedPomodoros(newCompletedCount)

      // Determine if it's time for a long break
      if (newCompletedCount % settings.longBreakInterval === 0) {
        setMode("longBreak")
        setTimeLeft(settings.longBreakDuration)
      } else {
        setMode("shortBreak")
        setTimeLeft(settings.shortBreakDuration)
      }
    } else {
      setMode("pomodoro")
      setTimeLeft(settings.pomodoroDuration)
    }
  }, [mode, completedPomodoros, settings])

  // Timer logic
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current)
      }
      startTimeRef.current = null
      return
    }

    // Set initial time when starting
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now()
    }

    let lastUpdate = Date.now()
    const updateTimer = () => {
      if (!isActive || !startTimeRef.current) return

      const now = Date.now()
      const elapsed = Math.floor((now - startTimeRef.current) / 1000)
      const remaining = Math.max(0, settings.pomodoroDuration - elapsed)
      
      if (remaining !== timeLeft) {
        setTimeLeft(remaining)
      }
      
      if (remaining === 0) {
        handleTimerComplete()
      } else {
        intervalRef.current = requestAnimationFrame(updateTimer)
      }
    }

    intervalRef.current = requestAnimationFrame(updateTimer)

    return () => {
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current)
      }
    }
  }, [isActive, settings.pomodoroDuration, handleTimerComplete])

  // Update timer when settings change
  useEffect(() => {
    if (!isActive) {
      if (mode === "pomodoro") {
        setTimeLeft(settings.pomodoroDuration)
      } else if (mode === "shortBreak") {
        setTimeLeft(settings.shortBreakDuration)
      } else {
        setTimeLeft(settings.longBreakDuration)
      }
    }
  }, [settings, mode, isActive])

  const startTimer = useCallback(() => {
    setIsActive(true)
  }, [])

  const pauseTimer = useCallback(() => {
    setIsActive(false)
  }, [])

  const resetTimer = useCallback(() => {
    setIsActive(false)
    if (intervalRef.current) {
      cancelAnimationFrame(intervalRef.current)
    }
    startTimeRef.current = null
    if (mode === "pomodoro") {
      setTimeLeft(settings.pomodoroDuration)
    } else if (mode === "shortBreak") {
      setTimeLeft(settings.shortBreakDuration)
    } else {
      setTimeLeft(settings.longBreakDuration)
    }
  }, [mode, settings])

  const switchMode = useCallback(
    (newMode: TimerMode) => {
      setIsActive(false)
      setMode(newMode)

      if (newMode === "pomodoro") {
        setTimeLeft(settings.pomodoroDuration * 60)
      } else if (newMode === "shortBreak") {
        setTimeLeft(settings.shortBreakDuration * 60)
      } else {
        setTimeLeft(settings.longBreakDuration * 60)
      }
    },
    [settings],
  )

  return {
    mode,
    timeLeft,
    isActive,
    completedPomodoros,
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
  }
}
