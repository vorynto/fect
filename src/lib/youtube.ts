// Extract a YouTube video ID from a full URL or a raw 11-char id
export function youtubeId(input: string): string {
  const v = (input || '').trim()
  if (!v) return ''
  if (/^[\w-]{11}$/.test(v)) return v
  const m = v.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/))([\w-]{11})/)
  return m ? m[1] : ''
}

export const youtubeEmbed = (input: string) => {
  const id = youtubeId(input)
  return id ? `https://www.youtube.com/embed/${id}` : ''
}

export const youtubeThumb = (input: string) => {
  const id = youtubeId(input)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ''
}
