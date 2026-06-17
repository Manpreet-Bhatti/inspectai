'use client'

import { useState, useEffect, useRef } from 'react'
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react'
import { offlineQueue } from '@/lib/offline-queue'
import { cn } from '@/lib/utils'

async function flushQueue(): Promise<void> {
  const [photos, voices] = await Promise.all([
    offlineQueue.getPhotos(),
    offlineQueue.getVoiceNotes(),
  ])

  for (const pending of photos) {
    try {
      const fd = new FormData()
      fd.append('inspectionId', pending.inspectionId)
      fd.append('category', pending.category)
      if (pending.location) fd.append('location', pending.location)
      fd.append('files', pending.file)
      const res = await fetch('/api/photos', { method: 'POST', body: fd })
      if (res.ok) await offlineQueue.removePhoto(pending.id)
    } catch { /* retry next online event */ }
  }

  for (const pending of voices) {
    try {
      const fd = new FormData()
      fd.append('inspectionId', pending.inspectionId)
      fd.append('audio', pending.blob, `voice-note-${pending.queuedAt}.webm`)
      fd.append('duration', String(pending.duration))
      const res = await fetch('/api/voice-notes', { method: 'POST', body: fd })
      if (res.ok) await offlineQueue.removeVoiceNote(pending.id)
    } catch { /* retry next online event */ }
  }
}

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [justSynced, setJustSynced] = useState(false)
  const syncingRef = useRef(false)

  async function refreshCount() {
    const n = await offlineQueue.count()
    setPendingCount(n)
    return n
  }

  async function sync() {
    if (syncingRef.current) return
    const count = await refreshCount()
    if (count === 0) return
    syncingRef.current = true
    setSyncing(true)
    try {
      await flushQueue()
      const remaining = await refreshCount()
      if (remaining === 0) {
        setJustSynced(true)
        setTimeout(() => setJustSynced(false), 3000)
      }
    } finally {
      syncingRef.current = false
      setSyncing(false)
    }
  }

  useEffect(() => {
    setIsOnline(navigator.onLine)
    refreshCount()

    const handleOnline = () => { setIsOnline(true); sync() }
    const handleOffline = () => { setIsOnline(false); refreshCount() }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  // ponytail: intentional empty deps — sync/refreshCount are stable module-level fns
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isOnline && pendingCount === 0 && !justSynced && !syncing) return null

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-sm',
        !isOnline
          ? 'bg-yellow-500/90 text-yellow-950'
          : 'bg-green-600/90 text-white'
      )}
    >
      {!isOnline ? (
        <>
          <WifiOff className="h-4 w-4" />
          Offline{pendingCount > 0 ? ` — ${pendingCount} queued` : ''}
        </>
      ) : syncing ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          Syncing {pendingCount} item{pendingCount !== 1 ? 's' : ''}...
        </>
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4" />
          All synced
        </>
      )}
    </div>
  )
}
