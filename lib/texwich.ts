export type LayerType = 'memo' | 'swatch' | 'mood' | 'photo' | 'sticker' | 'stamp'

export interface Layer {
  id: string
  type: LayerType
  x: number
  y: number
  rotation: number
  z: number
  /** memo */
  text?: string
  /** swatch */
  textureId?: string
  /** mood */
  moodId?: string
  /** photo */
  photoSrc?: string
  /** sticker */
  stickerId?: string
  /** stamp */
  stampId?: string
}

export interface Texture {
  id: string
  label: string
  src: string
}

export const TEXTURES: Texture[] = [
  { id: 'linen', label: '리넨', src: '/textures/linen.png' },
  { id: 'kraft', label: '크라프트', src: '/textures/kraft.png' },
  { id: 'gingham', label: '깅엄체크', src: '/textures/gingham.png' },
  { id: 'denim', label: '데님', src: '/textures/denim.png' },
  { id: 'grid', label: '모눈종이', src: '/textures/grid.png' },
]

export interface Mood {
  id: string
  label: string
  color: string
  ink: string
}

export const MOODS: Mood[] = [
  { id: 'joy', label: '기쁨', color: '#E9B44C', ink: '#5C4108' },
  { id: 'calm', label: '차분', color: '#8FA98F', ink: '#2E402E' },
  { id: 'flutter', label: '설렘', color: '#E38A8A', ink: '#5E2323' },
  { id: 'blue', label: '싱숭', color: '#9BA7C0', ink: '#2F3A52' },
]

export interface Sticker {
  id: string
  label: string
  src: string
  w: number
  h: number
}

export const STICKERS: Sticker[] = [
  { id: 'tape', label: '마스킹테이프', src: '/stickers/tape.png', w: 150, h: 52 },
  { id: 'flower', label: '데이지', src: '/stickers/flower.png', w: 76, h: 76 },
]

export type StampId = 'sunny' | 'cloudy' | 'rain' | 'snow' | 'date'

export const WEATHER_STAMPS: { id: StampId; label: string }[] = [
  { id: 'sunny', label: '맑음' },
  { id: 'cloudy', label: '흐림' },
  { id: 'rain', label: '비' },
  { id: 'snow', label: '눈' },
]

export function getTexture(id?: string) {
  return TEXTURES.find((t) => t.id === id) ?? TEXTURES[0]
}

export function getMood(id?: string) {
  return MOODS.find((m) => m.id === id) ?? MOODS[0]
}

export function getSticker(id?: string) {
  return STICKERS.find((s) => s.id === id) ?? STICKERS[0]
}

export function dateKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatKoreanDate(d: Date) {
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

let idCounter = 0
export function nextId() {
  idCounter += 1
  return `layer-${Date.now()}-${idCounter}`
}
