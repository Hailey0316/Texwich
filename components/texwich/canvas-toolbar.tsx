'use client'

import { useEffect, useRef, useState } from 'react'
import { Eraser, Grid3X3, MousePointer2, PaintBucket, Pen } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PAPER_PRESETS,
  PEN_COLORS,
  PEN_WIDTHS,
  paperBackground,
  type PaperStyle,
  type Tool,
} from '@/lib/texwich'

interface CanvasToolbarProps {
  tool: Tool
  onToolChange: (tool: Tool) => void
  penColor: string
  onPenColorChange: (color: string) => void
  penWidth: number
  onPenWidthChange: (width: number) => void
  tableRows: number
  tableCols: number
  onTableRowsChange: (rows: number) => void
  onTableColsChange: (cols: number) => void
  paper: PaperStyle
  onPaperChange: (paper: PaperStyle) => void
}

const TOOLS: { id: Tool; label: string; icon: typeof Pen }[] = [
  { id: 'select', label: '선택 / 이동', icon: MousePointer2 },
  { id: 'pen', label: '펜', icon: Pen },
  { id: 'table', label: '표 그리기', icon: Grid3X3 },
  { id: 'eraser', label: '지우개', icon: Eraser },
]

function isHex(value: string) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)
}

function HexField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const [text, setText] = useState(value)

  useEffect(() => {
    setText(value)
  }, [value])

  return (
    <label className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-[11px] text-muted-foreground">{label}</span>
      <input
        type="color"
        value={isHex(value) ? value : '#ffffff'}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${label} 색상 선택`}
        className="size-7 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
      />
      <input
        type="text"
        value={text}
        onChange={(e) => {
          const next = e.target.value
          setText(next)
          if (isHex(next)) onChange(next)
        }}
        placeholder="#FBF6EC"
        aria-label={`${label} 색상코드`}
        spellCheck={false}
        className="w-20 rounded border border-border bg-background px-1.5 py-1 font-mono text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </label>
  )
}

function PaperPopover({
  paper,
  onPaperChange,
  onClose,
}: {
  paper: PaperStyle
  onPaperChange: (paper: PaperStyle) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    window.addEventListener('pointerdown', handleDown)
    return () => window.removeEventListener('pointerdown', handleDown)
  }, [onClose])

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="용지 설정"
      className="absolute right-0 top-full z-50 mt-2 flex w-64 flex-col gap-3 rounded-lg border border-border bg-popover p-3 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-popover-foreground">용지 설정</h4>
        <div
          aria-hidden="true"
          className="h-6 w-10 rounded border border-border"
          style={{ background: paperBackground(paper) }}
        />
      </div>

      <div className="flex gap-1 rounded-md bg-muted p-0.5">
        {(['solid', 'gradient'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onPaperChange({ ...paper, mode })}
            className={cn(
              'flex-1 rounded px-2 py-1 text-[11px] transition-colors',
              paper.mode === mode
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {mode === 'solid' ? '단색' : '그라데이션'}
          </button>
        ))}
      </div>

      <HexField
        label={paper.mode === 'solid' ? '색상' : '시작색'}
        value={paper.color1}
        onChange={(color1) => onPaperChange({ ...paper, color1 })}
      />
      {paper.mode === 'gradient' && (
        <>
          <HexField
            label="끝색"
            value={paper.color2}
            onChange={(color2) => onPaperChange({ ...paper, color2 })}
          />
          <label className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-[11px] text-muted-foreground">방향</span>
            <input
              type="range"
              min={0}
              max={360}
              step={5}
              value={paper.angle}
              onChange={(e) => onPaperChange({ ...paper, angle: Number(e.target.value) })}
              aria-label="그라데이션 방향"
              className="min-w-0 flex-1 accent-primary"
            />
            <span className="w-9 text-right font-mono text-[11px] text-muted-foreground">
              {paper.angle}°
            </span>
          </label>
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-muted-foreground">프리셋</span>
        <div className="flex flex-wrap gap-1.5">
          {PAPER_PRESETS.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onPaperChange(preset)}
              aria-label={`용지 프리셋 ${i + 1}`}
              className="size-8 rounded border border-border transition-transform hover:scale-110"
              style={{ background: paperBackground(preset) }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <button
        type="button"
        aria-label={`${label} 줄이기`}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="size-5 rounded bg-muted text-xs leading-none text-foreground hover:bg-border"
      >
        -
      </button>
      <span className="w-4 text-center font-mono text-xs text-foreground">{value}</span>
      <button
        type="button"
        aria-label={`${label} 늘리기`}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="size-5 rounded bg-muted text-xs leading-none text-foreground hover:bg-border"
      >
        +
      </button>
    </div>
  )
}

export function CanvasToolbar({
  tool,
  onToolChange,
  penColor,
  onPenColorChange,
  penWidth,
  onPenWidthChange,
  tableRows,
  tableCols,
  onTableRowsChange,
  onTableColsChange,
  paper,
  onPaperChange,
}: CanvasToolbarProps) {
  const [paperOpen, setPaperOpen] = useState(false)

  return (
    <div className="relative z-40 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card/90 px-2 py-1.5 shadow-sm backdrop-blur">
      {/* tools */}
      <div className="flex items-center gap-0.5" role="group" aria-label="도구">
        {TOOLS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={tool === id}
            onClick={() => onToolChange(id)}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              tool === id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>

      {/* pen options */}
      {(tool === 'pen' || tool === 'table') && (
        <>
          <div aria-hidden="true" className="h-5 w-px bg-border" />
          <div className="flex items-center gap-1" role="group" aria-label="펜 색상">
            {PEN_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`펜 색상 ${color}`}
                aria-pressed={penColor === color}
                onClick={() => onPenColorChange(color)}
                className={cn(
                  'size-5 rounded-full border-2 transition-transform hover:scale-110',
                  penColor === color ? 'border-ring' : 'border-transparent',
                )}
                style={{ backgroundColor: color }}
              />
            ))}
            <input
              type="color"
              value={penColor}
              onChange={(e) => onPenColorChange(e.target.value)}
              aria-label="펜 색상 직접 선택"
              className="size-6 cursor-pointer rounded border border-border bg-transparent p-0.5"
            />
          </div>
        </>
      )}

      {tool === 'pen' && (
        <div className="flex items-center gap-1" role="group" aria-label="펜 굵기">
          {PEN_WIDTHS.map((width) => (
            <button
              key={width}
              type="button"
              aria-label={`펜 굵기 ${width}`}
              aria-pressed={penWidth === width}
              onClick={() => onPenWidthChange(width)}
              className={cn(
                'flex size-7 items-center justify-center rounded-md',
                penWidth === width ? 'bg-muted' : 'hover:bg-muted/60',
              )}
            >
              <span
                aria-hidden="true"
                className="rounded-full bg-foreground"
                style={{ width: width + 2, height: width + 2 }}
              />
            </button>
          ))}
        </div>
      )}

      {/* table options */}
      {tool === 'table' && (
        <>
          <div aria-hidden="true" className="h-5 w-px bg-border" />
          <Stepper label="행" value={tableRows} min={1} max={12} onChange={onTableRowsChange} />
          <Stepper label="열" value={tableCols} min={1} max={12} onChange={onTableColsChange} />
          <button
            type="button"
            onClick={() => {
              onTableRowsChange(6)
              onTableColsChange(7)
            }}
            className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground hover:opacity-80"
          >
            달력 (6x7)
          </button>
          <span className="hidden text-[11px] text-muted-foreground md:inline">
            용지 위를 드래그해 표를 그려요
          </span>
        </>
      )}

      {/* paper settings */}
      <div className="relative ml-auto">
        <button
          type="button"
          aria-label="용지 설정"
          aria-expanded={paperOpen}
          onClick={() => setPaperOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <PaintBucket className="size-4" />
          <span
            aria-hidden="true"
            className="h-4 w-6 rounded-sm border border-border"
            style={{ background: paperBackground(paper) }}
          />
        </button>
        {paperOpen && (
          <PaperPopover
            paper={paper}
            onPaperChange={onPaperChange}
            onClose={() => setPaperOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
