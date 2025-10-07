"use client"

import { useEffect, useState } from "react"

export type Note = {
  id: string
  eventId: string
  timestamp: number
  timeRange?: {
    start: number
    end: number
  }
  content: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "autoscale-notes"

export function useNotes(eventId: string) {
  const [notes, setNotes] = useState<Note[]>([])

  useEffect(() => {
    loadNotes()
  }, [eventId])

  const loadNotes = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const allNotes: Note[] = JSON.parse(stored)
        const eventNotes = allNotes.filter((n) => n.eventId === eventId)
        setNotes(eventNotes)
      }
    } catch (error) {
      console.error("[v0] Failed to load notes:", error)
    }
  }

  const addNote = (content: string, timestamp: number, timeRange?: { start: number; end: number }) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const allNotes: Note[] = stored ? JSON.parse(stored) : []

      const newNote: Note = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        eventId,
        timestamp,
        timeRange,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      allNotes.push(newNote)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allNotes))
      loadNotes()
      return newNote
    } catch (error) {
      console.error("[v0] Failed to add note:", error)
      return null
    }
  }

  const updateNote = (noteId: string, content: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return false

      const allNotes: Note[] = JSON.parse(stored)
      const noteIndex = allNotes.findIndex((n) => n.id === noteId)

      if (noteIndex === -1) return false

      allNotes[noteIndex].content = content
      allNotes[noteIndex].updatedAt = new Date().toISOString()

      localStorage.setItem(STORAGE_KEY, JSON.stringify(allNotes))
      loadNotes()
      return true
    } catch (error) {
      console.error("[v0] Failed to update note:", error)
      return false
    }
  }

  const deleteNote = (noteId: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return false

      const allNotes: Note[] = JSON.parse(stored)
      const filtered = allNotes.filter((n) => n.id !== noteId)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      loadNotes()
      return true
    } catch (error) {
      console.error("[v0] Failed to delete note:", error)
      return false
    }
  }

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
  }
}
