"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { RiMapPinLine, RiLoaderLine, RiCloseLine } from "@remixicon/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

export interface PlaceResult {
  displayName: string
  latitude: number
  longitude: number
  timezone: string | null
}

interface PlaceSearchProps {
  onSelect: (result: PlaceResult) => void
  className?: string
  invalid?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchTimezone(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lon}`
    )
    if (!res.ok) return null
    const data = (await res.json()) as { timeZone?: string }
    return data.timeZone ?? null
  } catch {
    return null
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PlaceSearch({ onSelect, className, invalid }: PlaceSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<NominatimResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const search = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (trimmed.length < 3) {
      setResults([])
      setOpen(false)
      return
    }
    setIsSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=6&addressdetails=0`,
        { headers: { "Accept-Language": "en" } }
      )
      const data = (await res.json()) as NominatimResult[]
      setResults(data)
      setOpen(data.length > 0)
    } catch {
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 400)
  }

  async function handleSelect(result: NominatimResult) {
    setOpen(false)
    setIsSelecting(true)
    setQuery(result.display_name)

    const lat = parseFloat(parseFloat(result.lat).toFixed(6))
    const lon = parseFloat(parseFloat(result.lon).toFixed(6))
    const timezone = await fetchTimezone(lat, lon)

    onSelect({ displayName: result.display_name, latitude: lat, longitude: lon, timezone })
    setIsSelecting(false)
  }

  function handleClear() {
    setQuery("")
    setResults([])
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <RiMapPinLine className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for a city or place…"
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          className={cn("pr-8 pl-8", className)}
          aria-invalid={invalid}
          autoComplete="off"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {(isSearching || isSelecting) ? (
            <RiLoaderLine className="size-4 animate-spin text-muted-foreground" />
          ) : query ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <RiCloseLine className="size-3.5" />
            </Button>
          ) : null}
        </div>
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
          {results.map((r) => (
            <li key={r.place_id}>
              <button
                type="button"
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleSelect(r)}
              >
                <RiMapPinLine className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <span className="line-clamp-2">{r.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
