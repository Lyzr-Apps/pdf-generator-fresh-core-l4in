'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FiX, FiClock, FiDownload, FiFileText, FiTrash2 } from 'react-icons/fi'

interface ArtifactFile {
  file_url: string
  name?: string
  format_type?: string
}

interface HistoryEntry {
  id: number
  url: string
  title: string
  timestamp: string
  files: ArtifactFile[]
}

interface HistorySidebarProps {
  open: boolean
  onClose: () => void
  history: HistoryEntry[]
  onClearHistory: () => void
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ts
  }
}

function truncateUrl(url: string, maxLen: number = 40): string {
  if (url.length <= maxLen) return url
  try {
    const parsed = new URL(url)
    const path = parsed.pathname
    const host = parsed.hostname.replace('www.', '')
    const display = host + path
    return display.length > maxLen ? display.slice(0, maxLen - 3) + '...' : display
  } catch {
    return url.slice(0, maxLen - 3) + '...'
  }
}

export default function HistorySidebar({ open, onClose, history, onClearHistory }: HistorySidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] backdrop-blur-[16px] bg-white/90 border-l border-white/20 shadow-xl transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FiClock className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground tracking-tight">Conversion History</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-[0.875rem]">
            <FiX className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <FiFileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No conversions yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your conversion history will appear here</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[0.875rem] border border-border bg-card p-3 space-y-2 hover:shadow-sm transition-shadow"
                >
                  <p className="text-xs font-medium text-foreground truncate" title={entry.title}>
                    {entry.title || 'Untitled'}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate" title={entry.url}>
                    {truncateUrl(entry.url)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.isArray(entry.files) && entry.files.map((file, fIdx) => (
                        file?.file_url ? (
                          <a
                            key={fIdx}
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            title={fIdx === 0 ? 'Clean Copy' : 'Compliance Report'}
                          >
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <FiDownload className="w-3 h-3" />
                            </Button>
                          </a>
                        ) : null
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {history.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-16 border-t border-border flex items-center justify-center px-4 bg-white/80 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="text-xs text-muted-foreground hover:text-destructive gap-1.5 rounded-[0.875rem]"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              Clear History
            </Button>
          </div>
        )}
      </aside>
    </>
  )
}
