'use client'

import { useRef } from 'react'
import { ArrowDown, ArrowUp, Cloud, CloudRain, Snowflake, Sun, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatKoreanDate, getMood, getSticker, getTexture, type Layer } from '@/lib/texwich'

const WEATHER_ICONS = {
  sunny: Sun,
  cloudy: Cloud,
  rain: CloudRain,
  snow: Snowflake,
} as const

const WEATHER_LABELS = {
  sunny: '맑음',
  cloudy: '흐림',
  rain: '비',
  snow: '눈',
} as const

interface LayerItemProps {
  layer: Layer
  date: Date
  selected: boolean
  editing: boolean
  onSelect: () => void
  onMove: (x: number, y: number) => void
  onStartEdit: () => void
  onChangeText: (text: string) => void
  onStopEdit: () => void
  onRaise: () => void
  onLower: () => void
  onDelete: () => void
}

export function LayerItem({
  layer,
  date,
  selected,
  editing,
  onSelect,
  onMove,
  onStartEdit,
  onChangeText,
  onStopEdit,
  onRaise,
  onLower,
  onDelete,
}: LayerItemProps) {
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)

  function handlePointerDown(e: React.PointerEvent) {
    if (editing) return
    e.preventDefault()
    onSelect()
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: layer.x,
      originY: layer.y,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragState.current) return
    const dx = e.clientX - dragState.current.startX
    const dy = e.clientY - dragState.current.startY
    onMove(dragState.current.originX + dx, dragState.current.originY + dy)
  }

  function handlePointerUp() {
    dragState.current = null
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${layer.type} 내지`}
      className={cn(
        'group absolute cursor-grab touch-none select-none focus:outline-none active:cursor-grabbing',
        selected && 'z-50',
      )}
      style={{
        left: layer.x,
        top: layer.y,
        zIndex: selected ? 999 : layer.z,
        transform: `rotate(${layer.rotation}deg)`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={() => {
        if (layer.type === 'memo') onStartEdit()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSelect()
      }}
    >
      {/* selection controls */}
      {selected && (
        <div className="absolute -top-10 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card px-1.5 py-1 shadow-md">
          <button
            type="button"
            aria-label="한 장 위로"
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onRaise}
          >
            <ArrowUp className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="한 장 아래로"
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onLower}
          >
            <ArrowDown className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="내지 삭제"
            className="rounded-full p-1 text-destructive hover:bg-destructive/10"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      )}

      <div
        className={cn(
          'transition-shadow',
          selected && 'rounded-sm ring-2 ring-ring ring-offset-2 ring-offset-background',
        )}
      >
        <LayerContent
          layer={layer}
          date={date}
          editing={editing}
          onChangeText={onChangeText}
          onStopEdit={onStopEdit}
        />
      </div>
    </div>
  )
}

function LayerContent({
  layer,
  date,
  editing,
  onChangeText,
  onStopEdit,
}: {
  layer: Layer
  date: Date
  editing: boolean
  onChangeText: (text: string) => void
  onStopEdit: () => void
}) {
  if (layer.type === 'memo') {
    return (
      <div className="w-44 rounded-sm border border-border/60 bg-card p-3 shadow-[2px_3px_8px_rgba(80,60,30,0.18)]">
        {editing ? (
          <textarea
            autoFocus
            value={layer.text ?? ''}
            onChange={(e) => onChangeText(e.target.value)}
            onBlur={onStopEdit}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onStopEdit()
            }}
            aria-label="메모 내용"
            className="font-display h-24 w-full resize-none bg-transparent text-2xl leading-relaxed text-card-foreground focus:outline-none"
          />
        ) : (
          <p className="font-display min-h-16 whitespace-pre-wrap text-2xl leading-relaxed text-card-foreground">
            {layer.text || '더블클릭해서 쓰기'}
          </p>
        )}
      </div>
    )
  }

  if (layer.type === 'swatch') {
    const texture = getTexture(layer.textureId)
    return (
      <div className="relative size-28 rounded-sm shadow-[2px_3px_8px_rgba(80,60,30,0.22)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={texture.src || '/placeholder.svg'}
          alt={`${texture.label} 텍스처 스와치`}
          draggable={false}
          className="size-full rounded-sm object-cover"
        />
        <div className="pointer-events-none absolute inset-1 rounded-sm border border-dashed border-white/70 mix-blend-overlay" />
      </div>
    )
  }

  if (layer.type === 'mood') {
    const mood = getMood(layer.moodId)
    return (
      <div
        className="relative flex size-24 flex-col items-center justify-center gap-1 rounded-sm shadow-[2px_3px_8px_rgba(80,60,30,0.2)]"
        style={{ backgroundColor: mood.color }}
      >
        <div
          className="pointer-events-none absolute inset-1 rounded-sm border border-dashed opacity-50"
          style={{ borderColor: mood.ink }}
        />
        <span className="font-display text-2xl" style={{ color: mood.ink }}>
          {mood.label}
        </span>
      </div>
    )
  }

  if (layer.type === 'photo') {
    return (
      <div className="w-44 rounded-sm bg-card p-2 pb-7 shadow-[3px_4px_10px_rgba(80,60,30,0.25)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={layer.photoSrc || '/placeholder.svg'}
          alt="다이어리 사진"
          draggable={false}
          className="h-32 w-full rounded-[2px] object-cover"
        />
      </div>
    )
  }

  if (layer.type === 'sticker') {
    const sticker = getSticker(layer.stickerId)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={sticker.src || '/placeholder.svg'}
        alt={`${sticker.label} 스티커`}
        draggable={false}
        width={sticker.w}
        height={sticker.h}
        className="mix-blend-multiply"
        style={{ width: sticker.w, height: sticker.h, objectFit: 'contain' }}
      />
    )
  }

  // stamp
  if (layer.stampId === 'date') {
    return (
      <div className="rounded-sm border-2 border-primary/70 px-3 py-1.5 opacity-90">
        <span className="font-display text-xl tracking-wide text-primary">
          {formatKoreanDate(date)}
        </span>
      </div>
    )
  }

  const weatherId = (layer.stampId ?? 'sunny') as keyof typeof WEATHER_ICONS
  const Icon = WEATHER_ICONS[weatherId]
  return (
    <div className="flex size-20 flex-col items-center justify-center gap-0.5 rounded-full border-2 border-accent/80 opacity-90">
      <Icon className="size-6 text-accent" aria-hidden="true" />
      <span className="font-display text-lg text-accent">{WEATHER_LABELS[weatherId]}</span>
    </div>
  )
}
