'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import type { AIAgentResponse } from '@/lib/aiAgent'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { FiFileText } from 'react-icons/fi'

import Header from './sections/Header'
import InputSection from './sections/InputSection'
import OutputSection from './sections/OutputSection'
import HistorySidebar from './sections/HistorySidebar'

// --- Types ---

interface ArtifactFile {
  file_url: string
  name?: string
  format_type?: string
}

interface ParsedData {
  source_url?: string
  document_title?: string
  section_count?: number
  word_count?: number
  extraction_summary?: string
  clean_copy_info?: string
  compliance_report_info?: string
}

interface HistoryEntry {
  id: number
  url: string
  title: string
  timestamp: string
  files: ArtifactFile[]
}

// --- Constants ---

const AGENT_ID = '69a28b54e72641e0c6070b2c'
const HISTORY_KEY = 'doctopdf_history'

const SAMPLE_PARSED_DATA: ParsedData = {
  source_url: 'https://docs.example.com/api/getting-started',
  document_title: 'API Getting Started Guide',
  section_count: 12,
  word_count: 3450,
  extraction_summary: 'Successfully extracted 12 sections from the API Getting Started Guide including authentication, endpoints, rate limiting, and error handling documentation.',
  clean_copy_info: 'A clean, faithful reproduction of the original documentation content formatted as a professional PDF with preserved heading hierarchy, code blocks, and tables.',
  compliance_report_info: 'Structured compliance report with document metadata, extraction timestamps, section inventory, word counts per section, and content integrity verification checksums.',
}

const SAMPLE_FILES: ArtifactFile[] = [
  { file_url: '#sample-clean-copy', name: 'clean_copy.pdf', format_type: 'pdf' },
  { file_url: '#sample-compliance-report', name: 'compliance_report.pdf', format_type: 'pdf' },
]

const SAMPLE_HISTORY: HistoryEntry[] = [
  {
    id: 1,
    url: 'https://docs.example.com/api/getting-started',
    title: 'API Getting Started Guide',
    timestamp: '2026-02-28T10:30:00.000Z',
    files: SAMPLE_FILES,
  },
  {
    id: 2,
    url: 'https://docs.example.com/sdk/python',
    title: 'Python SDK Reference',
    timestamp: '2026-02-27T14:15:00.000Z',
    files: [{ file_url: '#sample', name: 'python_sdk.pdf', format_type: 'pdf' }],
  },
]

// --- Theme ---

const THEME_VARS = {
  '--background': '210 20% 97%',
  '--foreground': '222 47% 11%',
} as React.CSSProperties

// --- ErrorBoundary ---

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// --- Helpers ---

function isUrlValid(url: string): boolean {
  if (!url.trim()) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

// --- Page ---

export default function Page() {
  // State
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingStep, setLoadingStep] = useState(0)
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [files, setFiles] = useState<ArtifactFile[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [sampleMode, setSampleMode] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setHistory(parsed)
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Cleanup loading interval
  useEffect(() => {
    return () => {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current)
    }
  }, [])

  const validUrl = isUrlValid(url)

  // Agent call
  const handleGenerate = useCallback(async () => {
    if (!validUrl) return

    setIsLoading(true)
    setError(null)
    setParsedData(null)
    setFiles([])
    setLoadingStep(0)
    setActiveAgentId(AGENT_ID)

    // Simulate step progression
    let step = 0
    loadingIntervalRef.current = setInterval(() => {
      step += 1
      if (step < 3) setLoadingStep(step)
    }, 4000)

    try {
      const response: AIAgentResponse = await callAIAgent(
        `Extract content from this documentation URL and generate two PDF files (clean copy and compliance report): ${url}`,
        AGENT_ID
      )

      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current)
      loadingIntervalRef.current = null

      if (response.success) {
        let data = response?.response?.result
        if (typeof data === 'string') {
          try { data = JSON.parse(data) } catch { /* use as-is */ }
        }

        const parsed: ParsedData = typeof data === 'object' && data !== null ? data as ParsedData : {}
        setParsedData(parsed)

        const artifactFiles = Array.isArray(response?.module_outputs?.artifact_files)
          ? response.module_outputs!.artifact_files
          : []
        setFiles(artifactFiles)

        // Save to history
        const entry: HistoryEntry = {
          id: Date.now(),
          url,
          title: parsed?.document_title ?? 'Untitled',
          timestamp: new Date().toISOString(),
          files: artifactFiles,
        }
        setHistory((prev) => {
          const updated = [entry, ...prev].slice(0, 20)
          try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)) } catch {}
          return updated
        })
      } else {
        setError(response?.error ?? 'Failed to generate PDFs. Please try again.')
      }
    } catch (err) {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current)
      loadingIntervalRef.current = null
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
      setActiveAgentId(null)
    }
  }, [url, validUrl])

  const handleRetry = useCallback(() => {
    setError(null)
    handleGenerate()
  }, [handleGenerate])

  const handleClearHistory = useCallback(() => {
    setHistory([])
    try { localStorage.removeItem(HISTORY_KEY) } catch {}
  }, [])

  // Determine what to display
  const displayData = sampleMode ? SAMPLE_PARSED_DATA : parsedData
  const displayFiles = sampleMode ? SAMPLE_FILES : files
  const displayHistory = sampleMode ? SAMPLE_HISTORY : history
  const hasResult = displayData !== null

  return (
    <ErrorBoundary>
      <div
        style={{
          background: 'linear-gradient(135deg, hsl(210 20% 97%) 0%, hsl(220 25% 95%) 35%, hsl(200 20% 96%) 70%, hsl(230 15% 97%) 100%)',
          minHeight: '100vh',
        }}
        className="text-foreground font-sans"
      >
        <Header
          historyOpen={historyOpen}
          onToggleHistory={() => setHistoryOpen((o) => !o)}
          historyCount={displayHistory.length}
        />

        <HistorySidebar
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          history={displayHistory}
          onClearHistory={handleClearHistory}
        />

        <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          {/* Sample Data Toggle */}
          <div className="max-w-2xl mx-auto flex items-center justify-end gap-2 mb-6">
            <label htmlFor="sample-toggle" className="text-xs text-muted-foreground cursor-pointer select-none">
              Sample Data
            </label>
            <Switch
              id="sample-toggle"
              checked={sampleMode}
              onCheckedChange={setSampleMode}
            />
          </div>

          <InputSection
            url={url}
            onUrlChange={setUrl}
            isValidUrl={validUrl}
            isLoading={isLoading}
            error={error}
            loadingStep={loadingStep}
            onGenerate={handleGenerate}
            onRetry={handleRetry}
            hasResult={hasResult}
          />

          {hasResult && (
            <OutputSection parsedData={displayData} files={displayFiles} />
          )}

          {/* Empty state */}
          {!hasResult && !isLoading && !error && (
            <div className="max-w-2xl mx-auto mt-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-4">
                <FiFileText className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                Paste a documentation URL above to generate compliance-ready PDFs. You will receive a clean copy and a structured compliance report.
              </p>
            </div>
          )}

          {/* Agent Status */}
          <div className="max-w-2xl mx-auto mt-12">
            <div className="backdrop-blur-[16px] bg-white/50 border border-white/20 rounded-[0.875rem] px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiFileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">Doc-to-PDF Agent</span>
                </div>
                <Badge
                  variant={activeAgentId ? 'default' : 'secondary'}
                  className="text-[10px] rounded-full px-2 py-0"
                >
                  {activeAgentId ? 'Processing' : 'Ready'}
                </Badge>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
