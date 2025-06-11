'use client'

import { RangeFilter as RangeFilterType, Stats } from '@/types/analytics'
import { Input } from '@/components/ui/input'

interface RangeFilterProps {
  label: string
  range: RangeFilterType
  stats: Stats
  onChange: (range: RangeFilterType) => void
}

export function RangeFilter({ label, range, stats, onChange }: RangeFilterProps) {
  const handleChange = (value: string, isMin: boolean) => {
    if (value === '') {
      onChange({
        ...range,
        [isMin ? 'min' : 'max']: ''
      })
    } else {
      const numValue = Number(value)
      if (!isNaN(numValue)) {
        onChange({
          ...range,
          [isMin ? 'min' : 'max']: numValue
        })
      }
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{label}</h4>
        <span className="text-sm text-muted-foreground">
          Range: {stats.min} - {stats.max}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder={`Min (${stats.min})`}
          value={range.min}
          onChange={e => handleChange(e.target.value, true)}
          min={stats.min}
          max={stats.max}
          className="w-24"
        />
        <span className="text-muted-foreground">to</span>
        <Input
          type="number"
          placeholder={`Max (${stats.max})`}
          value={range.max}
          onChange={e => handleChange(e.target.value, false)}
          min={stats.min}
          max={stats.max}
          className="w-24"
        />
      </div>
    </div>
  )
} 