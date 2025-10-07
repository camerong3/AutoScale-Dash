"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Note } from "@/lib/use-notes"
import { Pencil, Trash2, Clock } from "lucide-react"

type NotesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  notes: Note[]
  onAddNote: (content: string, timestamp: number, timeRange?: { start: number; end: number }) => void
  onUpdateNote: (noteId: string, content: string) => void
  onDeleteNote: (noteId: string) => void
  selectedTimeRange?: { start: number; end: number } | null
  currentTimestamp?: number
}

export function NotesDialog({
  open,
  onOpenChange,
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  selectedTimeRange,
  currentTimestamp,
}: NotesDialogProps) {
  const [newNoteContent, setNewNoteContent] = useState("")
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return

    const timestamp = currentTimestamp ?? Date.now()
    onAddNote(newNoteContent, timestamp, selectedTimeRange ?? undefined)
    setNewNoteContent("")
  }

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id)
    setEditContent(note.content)
  }

  const handleSaveEdit = () => {
    if (!editingNoteId || !editContent.trim()) return
    onUpdateNote(editingNoteId, editContent)
    setEditingNoteId(null)
    setEditContent("")
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
    setEditContent("")
  }

  const sortedNotes = [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Notes</DialogTitle>
          <DialogDescription>Add notes to track observations and events for this weight measurement.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add new note */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Add New Note</label>
            {selectedTimeRange && (
              <div className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-md flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                Time range: {selectedTimeRange.start.toFixed(1)} → {selectedTimeRange.end.toFixed(1)}
              </div>
            )}
            <Textarea
              placeholder="Enter your note here..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <Button onClick={handleAddNote} disabled={!newNoteContent.trim()} size="sm">
              Add Note
            </Button>
          </div>

          {/* Existing notes */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Existing Notes {notes.length > 0 && <span className="text-muted-foreground">({notes.length})</span>}
            </label>

            {sortedNotes.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-lg">
                No notes yet. Add your first note above.
              </div>
            ) : (
              <div className="space-y-3">
                {sortedNotes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {note.timeRange ? (
                            <span>
                              Range: {note.timeRange.start.toFixed(1)} → {note.timeRange.end.toFixed(1)}
                            </span>
                          ) : (
                            <span>Time: {note.timestamp.toFixed(1)}</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(note.createdAt).toLocaleString()}
                          {note.updatedAt !== note.createdAt && " (edited)"}
                        </div>
                      </div>
                      {editingNoteId !== note.id && (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleStartEdit(note)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onDeleteNote(note.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {editingNoteId === note.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
