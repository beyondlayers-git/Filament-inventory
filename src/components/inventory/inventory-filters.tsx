'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export function InventoryFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const q = searchParams.get('q') || ''
  const material = searchParams.get('material') || ''
  const sort = searchParams.get('sort') || ''

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.replace(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const hasFilters = q || material || sort

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-48 max-w-72">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="inventory-search"
          placeholder="Search by brand, color, material…"
          value={q}
          onChange={(e) => update('q', e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      {/* Material filter */}
      <Select
        value={material || 'all'}
        onValueChange={(v) => update('material', (v as string) === 'all' ? '' : (v as string))}
      >
        <SelectTrigger id="material-filter" className="h-8 w-32 text-sm">
          <SelectValue placeholder="Material" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All materials</SelectItem>
          <SelectItem value="PLA">PLA</SelectItem>
          <SelectItem value="PETG">PETG</SelectItem>
          <SelectItem value="ABS">ABS</SelectItem>
          <SelectItem value="TPU">TPU</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select
        value={sort || 'default'}
        onValueChange={(v) => update('sort', (v as string) === 'default' ? '' : (v as string))}
      >
        <SelectTrigger id="sort-select" className="h-8 w-44 text-sm">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Date added (newest)</SelectItem>
          <SelectItem value="date-asc">Date added (oldest)</SelectItem>
          <SelectItem value="weight-desc">Weight (most first)</SelectItem>
          <SelectItem value="weight-asc">Weight (least first)</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear */}
      {hasFilters && (
        <Button
          id="clear-filters-btn"
          variant="ghost"
          size="sm"
          onClick={() => router.replace(pathname)}
          className="h-8 text-xs text-muted-foreground"
        >
          <X size={12} className="mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
