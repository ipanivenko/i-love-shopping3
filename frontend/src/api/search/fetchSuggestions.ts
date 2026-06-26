import { API } from "../config"

export type SuggestionType = 'brand' | 'category' | 'product'

export interface SearchSuggestion {
  type: SuggestionType
  label: string
  value: string
  slug?: string
}

interface SuggestionsResponse {
  suggestions: SearchSuggestion[]
}

export async function fetchSuggestions(q: string): Promise<SearchSuggestion[]> {
  if (!q.trim()) return []

  const res = await fetch(
    `${API}/search/suggestions?query=${encodeURIComponent(q)}`
  )

  if (!res.ok) {
    throw new Error('Failed to fetch suggestions')
  }

  const data: SuggestionsResponse = await res.json()
  return data.suggestions
}