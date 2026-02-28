'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { FiFileText, FiClock } from 'react-icons/fi'

interface HeaderProps {
  historyOpen: boolean
  onToggleHistory: () => void
  historyCount: number
}

export default function Header({ historyOpen, onToggleHistory, historyCount }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-[16px] bg-white/75 border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-[0.875rem] bg-primary text-primary-foreground">
            <FiFileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground leading-tight">DocToPDF</h1>
            <p className="text-xs text-muted-foreground leading-tight">Documentation to Compliance PDF</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleHistory}
          className="relative rounded-[0.875rem] gap-2"
        >
          <FiClock className="w-4 h-4" />
          <span className="hidden sm:inline">History</span>
          {historyCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
              {historyCount > 9 ? '9+' : historyCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  )
}
