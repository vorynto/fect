import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { PageContent } from '../types'

function cacheKey(pageKey: string) { return `fect_page_v1_${pageKey}` }

function readPageCache(pageKey: string): Record<string, PageContent> | null {
  try {
    const raw = localStorage.getItem(cacheKey(pageKey))
    return raw ? (JSON.parse(raw) as Record<string, PageContent>) : null
  } catch { return null }
}

function writePageCache(pageKey: string, map: Record<string, PageContent>) {
  try { localStorage.setItem(cacheKey(pageKey), JSON.stringify(map)) } catch { /* quota */ }
}

export function usePageContent(pageKey: string) {
  const cached = readPageCache(pageKey)
  const [content, setContent] = useState<Record<string, PageContent>>(cached ?? {})
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    supabase
      .from('page_content')
      .select('*')
      .eq('page_key', pageKey)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, PageContent> = {}
          data.forEach(d => { map[d.section_key] = d })
          setContent(map)
          writePageCache(pageKey, map)
        }
        setLoading(false)
      })
  }, [pageKey])

  const get = (key: string, fallback = '') =>
    content[key]?.content ?? fallback

  const getTitle = (key: string, fallback = '') =>
    content[key]?.title ?? fallback

  const getImage = (key: string, fallback = '') =>
    content[key]?.image_url || fallback

  const getSection = (key: string) => content[key] ?? null

  return { content, loading, get, getTitle, getImage, getSection }
}
