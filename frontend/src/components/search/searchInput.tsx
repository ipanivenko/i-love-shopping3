import { useEffect, useState } from 'react'
import { fetchSuggestions, type SearchSuggestion } from '../../api/search/fetchSuggestions'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useSearchParams } from 'react-router'

export default function SearchInput() {
  const [searchParams] = useSearchParams()

  const urlQuery = searchParams.get("query") ?? ""
  const [query, setQuery] = useState(urlQuery)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const trimmed = query.trim()

    if (!trimmed || !isTyping) {
      setSuggestions([])
      setOpen(false)
      return
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true)
        const data = await fetchSuggestions(trimmed)
        setSuggestions(data)
        setOpen(true)
      } catch (error) {
        console.error(error)
        setSuggestions([])
        setOpen(false)
      } finally {
        setLoading(false)
      }
    }, 300) // debounce

    return () => clearTimeout(timeout)
  }, [query, isTyping])



  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

      <input
        type="text"
        value={query}
        onChange={(e) => {
          setIsTyping(true)
          setQuery(e.target.value)
        }}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true)
        }}

        onKeyDown={(e) => {
          if (e.key === "Enter") {
            navigate(`/products?query=${encodeURIComponent(query)}`)
            setOpen(false)
            setIsTyping(false)
          }
        }}
        onBlur={() => { 
          setTimeout(() => setOpen(false), 100)
        }}
        placeholder="Search products..."
        className="w-full rounded-lg border border-zinc-300 py-2 pl-10 pr-4 outline-none focus:border-black"
      />

      <button
            type="button"
            onClick={() => {
              setQuery("")
              setSuggestions([])
              setOpen(false)
              navigate("/products")
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
          >
            <X size={16} />
          </button>

      {open && query.length > 0 && suggestions.length > 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-lg bg-white shadow-lg">
          {loading ? (
            <div className="px-4 py-3 text-sm text-zinc-500">Loading...</div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((item) => (
                <li
                  key={`${item.type}-${item.value}`}
                  className="cursor-pointer px-4 py-3 hover:bg-zinc-100"
                  onMouseDown={() => {
                    setQuery(item.value)
                    navigate(`/products?query=${encodeURIComponent(item.value)}`)
                    setOpen(false)
                    setIsTyping(false)
                  }}
                >
                  <div className="font-medium">{item.label}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-zinc-500">No suggestions</div>
          )}
        </div>
      )}
    </div>
  )
}