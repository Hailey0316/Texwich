'use client'

import { useRef } from 'react'
import { Cloud, CloudRain, ImagePlus, Snowflake, Stamp, Sun } from 'lucide-react'
import { MOODS, STICKERS, TEXTURES, type Layer } from '@/lib/texwich'

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

interface IngredientTrayProps {
  onAdd: (partial: Partial<Layer> & { type: Layer['type'] }) => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  )
}

export function IngredientTray({ onAdd }: IngredientTrayProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onAdd({ type: 'photo', photoSrc: url })
    e.target.value = ''
  }

  return (
    <aside
      aria-label="재료 트레이"
      className="flex w-56 shrink-0 flex-col gap-6 overflow-y-auto border-r border-border bg-card/60 p-4"
    >
      <div>
        <h2 className="font-display text-2xl text-foreground">재료 트레이</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          재료를 눌러 오늘의 샌드위치에 내지를 쌓아보세요
        </p>
      </div>

      <Section title="메모">
        <button
          type="button"
          onClick={() => onAdd({ type: 'memo', text: '' })}
          className="flex h-16 w-full flex-col items-start justify-between rounded-sm border border-border bg-card p-2 text-left shadow-sm transition-transform hover:-rotate-1 hover:shadow-md"
        >
          <span className="font-display text-lg leading-none text-muted-foreground">
            오늘의 한 줄...
          </span>
          <span className="text-[10px] text-muted-foreground">텍스트 메모 추가</span>
        </button>
      </Section>

      <Section title="텍스처 스와치">
        {TEXTURES.map((texture) => (
          <button
            key={texture.id}
            type="button"
            onClick={() => onAdd({ type: 'swatch', textureId: texture.id })}
            className="group flex flex-col items-center gap-1"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={texture.src || '/placeholder.svg'}
              alt={`${texture.label} 스와치 추가`}
              className="size-12 rounded-sm object-cover shadow-sm transition-transform group-hover:-rotate-3 group-hover:scale-105"
            />
            <span className="text-[10px] text-muted-foreground">{texture.label}</span>
          </button>
        ))}
      </Section>

      <Section title="무드 스와치">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            type="button"
            onClick={() => onAdd({ type: 'mood', moodId: mood.id })}
            className="group flex flex-col items-center gap-1"
          >
            <span
              aria-hidden="true"
              className="block size-12 rounded-sm shadow-sm transition-transform group-hover:-rotate-3 group-hover:scale-105"
              style={{ backgroundColor: mood.color }}
            />
            <span className="text-[10px] text-muted-foreground">{mood.label}</span>
          </button>
        ))}
      </Section>

      <Section title="사진">
        <button
          type="button"
          onClick={() => onAdd({ type: 'photo', photoSrc: '/photos/sample.png' })}
          className="group flex flex-col items-center gap-1"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/photos/sample.png"
            alt="샘플 사진 추가"
            className="size-12 rounded-sm object-cover shadow-sm transition-transform group-hover:-rotate-3 group-hover:scale-105"
          />
          <span className="text-[10px] text-muted-foreground">샘플</span>
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group flex flex-col items-center gap-1"
        >
          <span className="flex size-12 items-center justify-center rounded-sm border border-dashed border-border bg-muted transition-colors group-hover:border-ring">
            <ImagePlus className="size-5 text-muted-foreground" aria-hidden="true" />
          </span>
          <span className="text-[10px] text-muted-foreground">업로드</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="사진 업로드"
          onChange={handleFileChange}
        />
      </Section>

      <Section title="스티커">
        {STICKERS.map((sticker) => (
          <button
            key={sticker.id}
            type="button"
            onClick={() => onAdd({ type: 'sticker', stickerId: sticker.id })}
            className="group flex flex-col items-center gap-1"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sticker.src || '/placeholder.svg'}
              alt={`${sticker.label} 스티커 추가`}
              className="size-12 rounded-sm object-contain mix-blend-multiply transition-transform group-hover:-rotate-3 group-hover:scale-105"
            />
            <span className="text-[10px] text-muted-foreground">{sticker.label}</span>
          </button>
        ))}
      </Section>

      <Section title="스탬프">
        {(Object.keys(WEATHER_ICONS) as (keyof typeof WEATHER_ICONS)[]).map((id) => {
          const Icon = WEATHER_ICONS[id]
          return (
            <button
              key={id}
              type="button"
              onClick={() => onAdd({ type: 'stamp', stampId: id })}
              className="group flex flex-col items-center gap-1"
            >
              <span className="flex size-12 items-center justify-center rounded-full border-2 border-accent/60 transition-transform group-hover:-rotate-6 group-hover:scale-105">
                <Icon className="size-5 text-accent" aria-hidden="true" />
              </span>
              <span className="text-[10px] text-muted-foreground">{WEATHER_LABELS[id]}</span>
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => onAdd({ type: 'stamp', stampId: 'date' })}
          className="group flex flex-col items-center gap-1"
        >
          <span className="flex size-12 items-center justify-center rounded-sm border-2 border-primary/60 transition-transform group-hover:-rotate-6 group-hover:scale-105">
            <Stamp className="size-5 text-primary" aria-hidden="true" />
          </span>
          <span className="text-[10px] text-muted-foreground">날짜</span>
        </button>
      </Section>
    </aside>
  )
}
