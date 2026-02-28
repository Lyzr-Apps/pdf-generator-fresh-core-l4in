'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FiLink, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi'

interface InputSectionProps {
  url: string
  onUrlChange: (val: string) => void
  isValidUrl: boolean
  isLoading: boolean
  error: string | null
  loadingStep: number
  onGenerate: () => void
  onRetry: () => void
  hasResult: boolean
}

const LOADING_STEPS = [
  'Extracting content from URL...',
  'Structuring document sections...',
  'Generating compliance PDFs...',
]

export default function InputSection({
  url,
  onUrlChange,
  isValidUrl,
  isLoading,
  error,
  loadingStep,
  onGenerate,
  onRetry,
  hasResult,
}: InputSectionProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="backdrop-blur-[16px] bg-white/75 border border-white/20 shadow-md rounded-[0.875rem] p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Documentation URL</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <FiLink className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="Paste documentation URL here..."
                disabled={isLoading}
                className="w-full h-12 pl-10 pr-10 rounded-[0.875rem] border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 transition-all"
              />
              {url.trim().length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValidUrl ? (
                    <FiCheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <FiAlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
              )}
            </div>
            {url.trim().length > 0 && !isValidUrl && (
              <p className="text-xs text-amber-600 mt-1.5">Please enter a valid URL starting with http:// or https://</p>
            )}
          </div>

          <Button
            onClick={onGenerate}
            disabled={!isValidUrl || isLoading}
            className="w-full h-11 rounded-[0.875rem] font-medium text-sm gap-2"
          >
            {isLoading ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Generate PDFs'
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="backdrop-blur-[16px] bg-red-50/80 border border-red-200/60 rounded-[0.875rem] p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-800">Generation Failed</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onRetry} className="flex-shrink-0 rounded-[0.875rem] text-xs border-red-200 text-red-700 hover:bg-red-100">
            Retry
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="backdrop-blur-[16px] bg-white/75 border border-white/20 shadow-md rounded-[0.875rem] p-6 space-y-4">
          <p className="text-sm font-medium text-foreground">Generating your PDFs...</p>
          <div className="space-y-3">
            {LOADING_STEPS.map((step, idx) => {
              const isActive = idx === loadingStep
              const isComplete = idx < loadingStep
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isComplete ? 'bg-emerald-500 text-white' : isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {isComplete ? (
                      <FiCheckCircle className="w-3.5 h-3.5" />
                    ) : isActive ? (
                      <FiLoader className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span className="text-[10px] font-semibold">{idx + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm transition-colors ${isActive ? 'text-foreground font-medium' : isComplete ? 'text-emerald-700' : 'text-muted-foreground'}`}>
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="space-y-3 pt-2">
            <Skeleton className="h-20 w-full rounded-[0.875rem]" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-32 rounded-[0.875rem]" />
              <Skeleton className="h-32 rounded-[0.875rem]" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
