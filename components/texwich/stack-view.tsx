'use client'

import { cn } from '@/lib/utils'
import { getMood, getSticker, getTexture, type Layer } from '@/lib/texwich'

const TYPE_LABELS: Record<Layer['type'], string> = {
  memo: '메모',
  swatch: '텍스처',
  mood: '무드',
  photo: '사진',
  sticker: '스티커',
  stamp: '스탬프',
}

interface StackViewProps {
  layers: Layer[]
  selectedId: string | null
  onSelectLayer: (id: string) => void
}

function sliceLabel(layer: Layer) {
  if (layer.type === 'memo') return layer.text?.trim() ? layer.text.slice(0, 12) : '메모'
  if (layer.type === 'swatch') return getTexture(layer.textureId).label
  if (layer.type === 'mood') return getMood(layer.moodId).label
  if (layer.type === 'sticker') return getSticker(layer.stickerId).label
  return TYPE_LABELS[layer.type]
}

function SliceFill({ layer }: { layer: Layer }) {
  if (layer.type === 'swatch') {
    const texture = getTexture(layer.textureId)
    return (
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${texture.src})` }}
      />
    )
  }
  if (layer.type === 'mood') {
    const mood = getMood(layer.moodId)
    return (
      <span aria-hidden="true" className="absolute inset-0" style={{ backgroundColor: mood.color }} />
    )
  }
  if (layer.type === 'photo') {
    return (
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center opacity-80"
        style={{ backgroundImage: `url(${layer.photoSrc})` }}
      />
    )
  }
  if (layer.type === 'sticker') {
    return <span aria-hidden="true" className="absolute inset-0 bg-secondary" />
  }
  if (layer.type === 'stamp') {
    return <span aria-hidden="true" className="absolute inset-0 bg-primary/15" />
  }
  // memo
  return <span aria-hidden="true" className="absolute inset-0 bg-card" />
}

export function StackView({ layers, selectedId, onSelectLayer }: StackViewProps) {
  // top of the sandwich = highest z
  const sorted = [...layers].sort((a, b) => b.z - a.z)

  return (
    <aside
      aria-label="오늘의 샌드위치 단면"
      className="flex w-60 shrink-0 flex-col border-l border-border bg-card/60 p-4"
    >
      <h2 className="font-display text-2xl text-foreground">오늘의 샌드위치</h2>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {layers.length > 0 ? `내지 ${layers.length}장이 쌓였어요` : '아직 재료가 없어요'}
      </p>

      <div className="mt-6 flex flex-col items-center">
        {/* top bread */}
        <div
          aria-hidden="true"
          className="h-9 w-44 rounded-t-[3rem] rounded-b-md border border-bread-crust/50 bg-bread shadow-sm"
        />

        {/* fillings */}
        <ul className="flex w-48 flex-col-reverse items-center" aria-label="쌓인 내지 목록">
          {[...sorted].reverse().map((layer, index) => (
            <li key={layer.id} className="-mt-1 w-full first:mt-0" style={{ zIndex: index + 1 }}>
              <button
                type="button"
                onClick={() => onSelectLayer(layer.id)}
                className={cn(
                  'relative block h-7 w-full overflow-hidden rounded-md border border-foreground/15 shadow-sm transition-transform hover:-translate-x-1',
                  selectedId === layer.id &&
                    'ring-2 ring-ring ring-offset-1 ring-offset-background',
                )}
                style={{
                  marginLeft: index % 2 === 0 ? '-6px' : '6px',
                }}
              >
                <SliceFill layer={layer} />
                <span className="relative z-10 flex h-full items-center justify-between px-2">
                  <span className="max-w-28 truncate rounded-sm bg-background/80 px-1 text-[10px] text-foreground">
                    {sliceLabel(layer)}
                  </span>
                  <span className="rounded-sm bg-background/80 px-1 text-[9px] text-muted-foreground">
                    {TYPE_LABELS[layer.type]}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {layers.length === 0 && (
          <div className="flex h-16 w-44 items-center justify-center rounded-md border border-dashed border-border">
            <span className="text-[11px] text-muted-foreground">속재료를 채워주세요</span>
          </div>
        )}

        {/* bottom bread */}
        <div
          aria-hidden="true"
          className="-mt-1 h-6 w-44 rounded-b-2xl rounded-t-md border border-bread-crust/50 bg-bread shadow-sm"
        />
      </div>

      <p className="mt-auto pt-6 text-[11px] leading-relaxed text-muted-foreground">
        단면을 누르면 캔버스에서 해당 내지가 선택돼요. 위에 있을수록 나중에 쌓인 내지예요.
      </p>
    </aside>
  )
}
