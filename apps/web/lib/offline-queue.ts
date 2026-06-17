const DB_NAME = 'inspectai-offline'
const DB_VERSION = 1

export interface PendingPhoto {
  id: string
  inspectionId: string
  file: File
  category: string
  location?: string
  queuedAt: number
}

export interface PendingVoiceNote {
  id: string
  inspectionId: string
  blob: Blob
  duration: number
  queuedAt: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore('photos', { keyPath: 'id' })
      req.result.createObjectStore('voiceNotes', { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbOp<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode)
    const req = fn(tx.objectStore(storeName))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export const offlineQueue = {
  async addPhoto(item: Omit<PendingPhoto, 'id' | 'queuedAt'>): Promise<void> {
    await idbOp('photos', 'readwrite', s =>
      s.add({ ...item, id: crypto.randomUUID(), queuedAt: Date.now() })
    )
  },

  getPhotos(): Promise<PendingPhoto[]> {
    return idbOp('photos', 'readonly', s => s.getAll())
  },

  async removePhoto(id: string): Promise<void> {
    await idbOp('photos', 'readwrite', s => s.delete(id))
  },

  async addVoiceNote(item: Omit<PendingVoiceNote, 'id' | 'queuedAt'>): Promise<void> {
    await idbOp('voiceNotes', 'readwrite', s =>
      s.add({ ...item, id: crypto.randomUUID(), queuedAt: Date.now() })
    )
  },

  getVoiceNotes(): Promise<PendingVoiceNote[]> {
    return idbOp('voiceNotes', 'readonly', s => s.getAll())
  },

  async removeVoiceNote(id: string): Promise<void> {
    await idbOp('voiceNotes', 'readwrite', s => s.delete(id))
  },

  async count(): Promise<number> {
    const [p, v] = await Promise.all([
      idbOp<number>('photos', 'readonly', s => s.count()),
      idbOp<number>('voiceNotes', 'readonly', s => s.count()),
    ])
    return p + v
  },
}
