"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/types/database.types"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

export type TimerMode = "pomodoro" | "shortBreak" | "longBreak"

interface PomodoroSettings {
  pomodoroDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  soundEnabled: boolean
  notificationsEnabled: boolean
}

type TimerState = Database['public']['Tables']['timer_states']['Row']

export function usePomodoro(settings: PomodoroSettings) {
  const [mode, setMode] = useState<TimerMode>("pomodoro")
  const [timeLeft, setTimeLeft] = useState(settings.pomodoroDuration)
  const [isActive, setIsActive] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Handle client-side initialization
  useEffect(() => {
    setIsClient(true)
    audioRef.current = new Audio("/sounds/bell.mp3")

    // Subscribe to timer state changes
    const channel = supabase
      .channel('timer_state')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timer_states'
        },
        (payload: RealtimePostgresChangesPayload<TimerState>) => {
          if (payload.new && typeof payload.new === 'object') {
            const newState = payload.new as TimerState
            setMode(newState.mode as TimerMode)
            setTimeLeft(newState.time_left)
            setIsActive(newState.is_active)
            if (newState.start_time) {
              startTimeRef.current = new Date(newState.start_time).getTime()
            }
          }
        }
      )
      .subscribe()

    // Load initial state from database
    const loadTimerState = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          console.error('Error getting session:', sessionError)
          return
        }

        if (!session) {
          console.error('No active session')
          return
        }

        const { data: timerState, error } = await supabase
          .from('timer_states')
          .select()
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (error) {
          console.error('Error loading timer state:', error)
          return
        }

        if (timerState) {
          setMode(timerState.mode as TimerMode)
          setTimeLeft(timerState.time_left)
          setIsActive(timerState.is_active)
          if (timerState.start_time) {
            startTimeRef.current = new Date(timerState.start_time).getTime()
          }
        }
      } catch (error) {
        console.error('Error in loadTimerState:', error)
      }
    }

    loadTimerState()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      channel.unsubscribe()
    }
  }, [supabase])

  // Update timer state in database
  const updateTimerState = useCallback(async (updates: {
    mode?: TimerMode
    timeLeft?: number
    isActive?: boolean
    startTime?: number | null
  }) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error('Error getting session:', sessionError)
        return
      }

      if (!session) {
        console.error('No active session')
        return
      }

      const { data: existingState, error: fetchError } = await supabase
        .from('timer_states')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (fetchError) {
        console.error('Error fetching existing state:', fetchError)
        return
      }

      const timerState = {
        user_id: session.user.id,
        mode: updates.mode ?? mode,
        time_left: updates.timeLeft ?? timeLeft,
        is_active: updates.isActive ?? isActive,
        start_time: updates.startTime ? new Date(updates.startTime).toISOString() : null,
        updated_at: new Date().toISOString()
      }

      if (existingState) {
        const { error: updateError } = await supabase
          .from('timer_states')
          .update(timerState)
          .eq('id', existingState.id)

        if (updateError) {
          console.error('Error updating timer state:', updateError)
        }
      } else {
        // Create initial timer state
        const { error: insertError } = await supabase
          .from('timer_states')
          .insert({
            ...timerState,
            created_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error inserting timer state:', insertError)
        }
      }
    } catch (error) {
      console.error('Error in updateTimerState:', error)
    }
  }, [mode, timeLeft, isActive, supabase])

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
    const now = Date.now()
    setIsActive(true)
    startTimeRef.current = now
    updateTimerState({ isActive: true, startTime: now })
  }, [updateTimerState])

  const pauseTimer = useCallback(() => {
    setIsActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    updateTimerState({ isActive: false, startTime: null })
  }, [updateTimerState])

  const resetTimer = useCallback(() => {
    setIsActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    startTimeRef.current = null
    const newTimeLeft = mode === "pomodoro" 
      ? settings.pomodoroDuration 
      : mode === "shortBreak" 
        ? settings.shortBreakDuration 
        : settings.longBreakDuration
    setTimeLeft(newTimeLeft)
    updateTimerState({ 
      isActive: false, 
      startTime: null,
      timeLeft: newTimeLeft 
    })
  }, [mode, settings, updateTimerState])

  const switchMode = useCallback(
    (newMode: TimerMode) => {
      setIsActive(false)
      setMode(newMode)
      const newTimeLeft = newMode === "pomodoro" 
        ? settings.pomodoroDuration 
        : newMode === "shortBreak" 
          ? settings.shortBreakDuration 
          : settings.longBreakDuration
      setTimeLeft(newTimeLeft)
      updateTimerState({ 
        mode: newMode, 
        isActive: false, 
        startTime: null,
        timeLeft: newTimeLeft 
      })
    },
    [settings, updateTimerState],
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
