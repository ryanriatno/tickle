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
  const [isClient, setIsClient] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Handle client-side initialization
  useEffect(() => {
    setIsClient(true)
    const savedMode = localStorage.getItem("pomodoroMode")
    const savedTime = localStorage.getItem("pomodoroTimeLeft")
    const savedIsActive = localStorage.getItem("pomodoroIsActive")
    const savedCount = localStorage.getItem("completedPomodoros")

    if (savedMode) setMode(savedMode as TimerMode)
    if (savedTime) setTimeLeft(parseInt(savedTime))
    if (savedIsActive) setIsActive(savedIsActive === "true")
    if (savedCount) setCompletedPomodoros(parseInt(savedCount))

    audioRef.current = new Audio("/sounds/bell.mp3")

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("pomodoroMode", mode)
      localStorage.setItem("pomodoroTimeLeft", timeLeft.toString())
      localStorage.setItem("pomodoroIsActive", isActive.toString())
      localStorage.setItem("completedPomodoros", completedPomodoros.toString())
    }
  }, [mode, timeLeft, isActive, completedPomodoros, isClient])

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
        clearInterval(intervalRef.current)
      }
      return
    }

    // Set initial time when starting
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now()
    }

    const updateTimer = () => {
      if (!isActive || !startTimeRef.current) return

      const now = Date.now()
      const elapsed = Math.floor((now - startTimeRef.current) / 1000)
      const initialDuration = mode === "pomodoro" 
        ? settings.pomodoroDuration 
        : mode === "shortBreak" 
          ? settings.shortBreakDuration 
          : settings.longBreakDuration
      const remaining = Math.max(0, initialDuration - elapsed)
      
      if (remaining !== timeLeft) {
        setTimeLeft(remaining)
      }
      
      if (remaining === 0) {
        handleTimerComplete()
      }
    }

    // Update every second
    intervalRef.current = setInterval(updateTimer, 1000)
    updateTimer() // Run immediately

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, mode, settings, handleTimerComplete])

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
    startTimeRef.current = Date.now()
  }, [])

  const pauseTimer = useCallback(() => {
    setIsActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])

  const resetTimer = useCallback(() => {
    setIsActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
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
