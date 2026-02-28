'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FiFileText, FiDownload, FiCheckCircle, FiExternalLink } from 'react-icons/fi'

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

interface OutputSectionProps {
  parsedData: ParsedData | null
  files: ArtifactFile[]
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-2 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-2 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-3 mb-1">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

export default function OutputSection({ parsedData, files }: OutputSectionProps) {
  if (!parsedData) return null

  const title = parsedData?.document_title ?? 'Untitled Document'
  const sectionCount = parsedData?.section_count ?? 0
  const wordCount = parsedData?.word_count ?? 0
  const summary = parsedData?.extraction_summary ?? ''
  const sourceUrl = parsedData?.source_url ?? ''
  const cleanCopyInfo = parsedData?.clean_copy_info ?? ''
  const complianceInfo = parsedData?.compliance_report_info ?? ''

  const cleanCopyFile = files.length > 0 ? files[0] : null
  const complianceFile = files.length > 1 ? files[1] : null

  const pdfCards = [
    {
      label: 'Clean Copy',
      info: cleanCopyInfo,
      file: cleanCopyFile,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      label: 'Compliance Report',
      info: complianceInfo,
      file: complianceFile,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
  ].filter((card) => card.file || card.info)

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 mt-6">
      <div className="backdrop-blur-[16px] bg-white/75 border border-white/20 shadow-md rounded-[0.875rem] p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-[0.875rem] bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <FiCheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground tracking-tight truncate">{title}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {sectionCount > 0 && (
                <Badge variant="secondary" className="text-xs rounded-full">{sectionCount} sections</Badge>
              )}
              {wordCount > 0 && (
                <Badge variant="secondary" className="text-xs rounded-full">{wordCount.toLocaleString()} words</Badge>
              )}
            </div>
          </div>
        </div>

        {sourceUrl && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-muted/50">
            <FiExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground truncate transition-colors"
            >
              {sourceUrl}
            </a>
          </div>
        )}

        {summary && (
          <div className="text-sm text-muted-foreground">
            {renderMarkdown(summary)}
          </div>
        )}
      </div>

      <div className={`grid gap-4 ${pdfCards.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
        {pdfCards.map((card, idx) => (
          <div
            key={idx}
            className={`backdrop-blur-[16px] bg-white/75 border border-white/20 shadow-md rounded-[0.875rem] p-5 flex flex-col`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-lg ${card.bgColor} ${card.borderColor} border flex items-center justify-center`}>
                <FiFileText className={`w-4 h-4 ${card.iconColor}`} />
              </div>
              <h3 className="text-sm font-semibold text-foreground tracking-tight">{card.label}</h3>
            </div>

            {card.info && (
              <div className="text-xs text-muted-foreground mb-4 flex-1">
                {renderMarkdown(card.info)}
              </div>
            )}

            {card.file?.file_url && (
              <a
                href={card.file.file_url}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-[0.875rem] gap-2 text-xs font-medium"
                >
                  <FiDownload className="w-3.5 h-3.5" />
                  Download PDF
                </Button>
              </a>
            )}

            {!card.file?.file_url && (
              <div className="text-xs text-muted-foreground italic">PDF not available</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
