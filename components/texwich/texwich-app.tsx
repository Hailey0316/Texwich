'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { dateKey, formatKoreanDate, nextId, type Layer } from '@/lib/texwich'
import { IngredientTray } from '@/components/texwich/ingredient-tray'
import { LayerItem } from '@/components/texwich/layer-item'
import { StackView } from '@/components/texwich/stack-view'

function seedToday(): Layer[] {
  return [
    { id: nextId(), type: 'swatch', textureId: 'linen', x: 180, y: 120, rotation: -4, z: 1 },
    {
      id: nextId(),
      type: 'memo',
      text: '텍스위치 첫 기록!\n오늘부터 하루를 쌓아보자',
      x: 300,
      y: 170,
      rotation: 2,
      z: 2,
    },
    { id: nextId(), type: 'stamp', stampId: 'date', x: 340, y: 60, rotation: -3, z: 3 },
    { id: nextId(), type: 'sticker', stickerId: 'flower', x: 230, y: 300, rotation: 8, z: 4 },
  ]
}

export function TexwichApp() {
  const [entries, setEntries] = useState<Record<string, Layer[]>>(() => ({
    [dateKey(new Date())]: seedToday(),
  }))
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const key = dateKey(currentDate)
  const layers = useMemo(() => entries[key] ?? [], [entries, key])

  const updateLayers = useCallback(
    (updater: (prev: Layer[]) => Layer[]) => {
      setEntries((prev) => ({ ...prev, [key]: updater(prev[key] ?? []) }))
    },
    [key],
  )

  function addLayer(partial: Partial<Layer> & { type: Layer['type'] }) {
    const bounds = canvasRef.current?.getBoundingClientRect()
    const centerX = bounds ? bounds.width / 2 - 80 : 240
    const centerY = bounds ? bounds.height / 2 - 80 : 180
    const jitter = () => Math.round((Math.random() - 0.5) * 120)
    const id = nextId()
    updateLayers((prev) => {
      const maxZ = prev.reduce((max, layer) => Math.max(max, layer.z), 0)
      return [
        ...prev,
        {
          x: centerX + jitter(),
          y: centerY + jitter(),
          rotation: Math.round((Math.random() - 0.5) * 12),
          ...partial,
          id,
          z: maxZ + 1,
        },
      ]
    })
    setSelectedId(id)
    if (partial.type === 'memo') setEditingId(id)
  }

  function moveLayer(id: string, x: number, y: number) {
    updateLayers((prev) => prev.map((layer) => (layer.id === id ? { ...layer, x, y } : layer)))
  }

  function changeText(id: string, text: string) {
    updateLayers((prev) => prev.map((layer) => (layer.id === id ? { ...layer, text } : layer)))
  }

  function shiftZ(id: string, direction: 1 | -1) {
    updateLayers((prev) => {
      const ordered = [...prev].sort((a, b) => a.z - b.z)
      const index = ordered.findIndex((layer) => layer.id === id)
      const swapWith = index + direction
      if (index < 0 || swapWith < 0 || swapWith >= ordered.length) return prev
      const temp = ordered[index].z
      ordered[index] = { ...ordered[index], z: ordered[swapWith].z }
      ordered[swapWith] = { ...ordered[swapWith], z: temp }
      return ordered
    })
  }

  function deleteLayer(id: string) {
    updateLayers((prev) => prev.filter((layer) => layer.id !== id))
    setSelectedId((prev) => (prev === id ? null : prev))
    setEditingId((prev) => (prev === id ? null : prev))
  }

  function goToDay(offset: number) {
    setCurrentDate((prev) => {
      const next = new Date(prev)
      next.setDate(next.getDate() + offset)
      return next
    })
    setSelectedId(null)
    setEditingId(null)
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (editingId) return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
        deleteLayer(selectedId)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  const isToday = key === dateKey(new Date())

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* header */}
      <header className="flex items-center justify-between border-b border-border bg-card/60 px-5 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-3xl leading-none text-primary">Texwich</h1>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Texture + Swatch, 하루를 쌓는 다이어리
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="이전 날짜"
            onClick={() => goToDay(-1)}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-44 text-center text-sm font-medium text-foreground">
            {formatKoreanDate(currentDate)}
            {isToday && (
              <span className="ml-1.5 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">
                오늘
              </span>
            )}
          </span>
          <button
            type="button"
            aria-label="다음 날짜"
            onClick={() => goToDay(1)}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <IngredientTray onAdd={addLayer} />

        {/* canvas */}
        <main className="relative min-w-0 flex-1 p-5">
          <div
            ref={canvasRef}
            role="application"
            aria-label="오늘의 콜라주 캔버스"
            className="relative size-full overflow-hidden rounded-xl border border-border bg-card shadow-[inset_0_1px_6px_rgba(80,60,30,0.08)]"
            style={{
              backgroundImage: 'url(/textures/grid.png)',
              backgroundSize: '360px',
            }}
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedId(null)
                setEditingId(null)
              }
            }}
          >
            {layers.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
                <p className="font-display text-3xl text-muted-foreground">
                  빈 접시 위에 하루를 쌓아보세요
                </p>
                <p className="text-xs text-muted-foreground">
                  왼쪽 재료 트레이에서 내지를 골라 추가할 수 있어요
                </p>
              </div>
            )}

            {layers.map((layer) => (
              <LayerItem
                key={layer.id}
                layer={layer}
                date={currentDate}
                selected={selectedId === layer.id}
                editing={editingId === layer.id}
                onSelect={() => setSelectedId(layer.id)}
                onMove={(x, y) => moveLayer(layer.id, x, y)}
                onStartEdit={() => setEditingId(layer.id)}
                onChangeText={(text) => changeText(layer.id, text)}
                onStopEdit={() => setEditingId(null)}
                onRaise={() => shiftZ(layer.id, 1)}
                onLower={() => shiftZ(layer.id, -1)}
                onDelete={() => deleteLayer(layer.id)}
              />
            ))}
          </div>
        </main>

        <StackView layers={layers} selectedId={selectedId} onSelectLayer={setSelectedId} />
      </div>
    </div>
  )
}
