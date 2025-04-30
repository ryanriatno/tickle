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
  const [timeLeft, setTimeLeft] = useState(settings.pomodoroDuration * 60)
  const [isActive, setIsActive] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/bell.mp3")
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Update timer when settings change
  useEffect(() => {
    if (mode === "pomodoro") {
      setTimeLeft(settings.pomodoroDuration * 60)
    } else if (mode === "shortBreak") {
      setTimeLeft(settings.shortBreakDuration * 60)
    } else {
      setTimeLeft(settings.longBreakDuration * 60)
    }
  }, [settings, mode])

  // Timer logic
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleTimerComplete()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive])

  const handleTimerComplete = useCallback(() => {
    setIsActive(false)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
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
        setTimeLeft(settings.longBreakDuration * 60)
      } else {
        setMode("shortBreak")
        setTimeLeft(settings.shortBreakDuration * 60)
      }
    } else {
      setMode("pomodoro")
      setTimeLeft(settings.pomodoroDuration * 60)
    }
  }, [mode, completedPomodoros, settings])

  const startTimer = useCallback(() => {
    setIsActive(true)
  }, [])

  const pauseTimer = useCallback(() => {
    setIsActive(false)
  }, [])

  const resetTimer = useCallback(() => {
    setIsActive(false)
    if (mode === "pomodoro") {
      setTimeLeft(settings.pomodoroDuration * 60)
    } else if (mode === "shortBreak") {
      setTimeLeft(settings.shortBreakDuration * 60)
    } else {
      setTimeLeft(settings.longBreakDuration * 60)
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
