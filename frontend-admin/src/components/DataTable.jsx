import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const PAGE_SIZE_OPTIONS = [20, 50, 100]
const SEARCH_DEBOUNCE_MS = 300

/**
 * Enterprise DataTable: sort, search (debounced), page size, sticky header & optional first column,
 * loading skeleton, empty state, optional row selection with indeterminate.
 * Optional: visibleColumns (filter), selectable + selectedRowIds + onSelectionChange, stickyFirstColumn.
 */
export function DataTable({
  columns,
  data,
  keyId = 'id',
  page = 1,
  total = 0,
  limit = 20,
  onPageChange,
  onLimitChange,
  renderCell,
  className,
  sortKey,
  sortOrder,
  onSortChange,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  emptyMessage = 'No data',
  loading = false,
  visibleColumns,
  stickyFirstColumn = false,
  selectable = false,
  selectedRowIds = [],
  onSelectionChange,
}) {
  const [searchInput, setSearchInput] = React.useState(searchValue ?? '')
  const visibleKeys = React.useMemo(
    () => (visibleColumns && visibleColumns.length > 0 ? visibleColumns : columns.map((c) => c.key)),
    [visibleColumns, columns]
  )
  const cols = React.useMemo(() => columns.filter((c) => visibleKeys.includes(c.key)), [columns, visibleKeys])
  const selectedSet = React.useMemo(() => new Set(selectedRowIds), [selectedRowIds])
  const allIds = React.useMemo(() => data.map((r) => r[keyId] ?? r.id).filter(Boolean), [data, keyId])
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedSet.has(id))
  const indeterminate = selectedSet.size > 0 && selectedSet.size < allIds.length

  React.useEffect(() => {
    setSearchInput((prev) => (searchValue !== undefined && searchValue !== prev ? searchValue : prev))
  }, [searchValue])

  const searchDebounceRef = React.useRef(null)
  const handleSearchInput = (v) => {
    setSearchInput(v)
    if (onSearchChange) {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
      searchDebounceRef.current = setTimeout(() => onSearchChange(v), SEARCH_DEBOUNCE_MS)
    }
  }

  const toggleAll = () => {
    if (!onSelectionChange) return
    if (allSelected) onSelectionChange([])
    else onSelectionChange([...allIds])
  }
  const toggleRow = (id) => {
    if (!onSelectionChange) return
    const next = new Set(selectedRowIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange([...next])
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const hasPrev = page > 1
  const hasNext = page < totalPages
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className={cn('space-y-4', className)}>
      {(searchPlaceholder != null || onLimitChange) && (
        <div className="flex flex-wrap items-center gap-4">
          {searchPlaceholder != null && (
            <Input
              placeholder={searchPlaceholder}
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              className="max-w-xs h-9 text-sm border-border/50 bg-muted/30"
            />
          )}
          {onLimitChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="h-9 rounded-md border border-border/50 bg-muted/30 px-2 text-sm text-muted-foreground"
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="text-sm text-muted-foreground">per page</span>
            </div>
          )}
        </div>
      )}

      <div className="rounded-md border border-border/50 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              {selectable && (
                <TableHead className="sticky top-0 z-10 w-10 bg-muted/30 border-border/50">
                  <Checkbox
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = indeterminate }}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {cols.map((col, colIndex) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    'sticky top-0 z-10 bg-muted/30 text-muted-foreground border-border/50',
                    stickyFirstColumn && colIndex === 0 && 'sticky left-0 z-20 bg-muted/50',
                    onSortChange && (col.sortable !== false) && 'cursor-pointer select-none hover:bg-muted/50'
                  )}
                  onClick={() => onSortChange && col.sortable !== false && onSortChange(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {onSortChange && (col.sortable !== false) && sortKey === col.key && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: Math.min(5, limit) }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="border-border/50 hover:bg-muted/30">
                  {selectable && <TableCell className="border-border/50 w-10" />}
                  {cols.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn('border-border/50', stickyFirstColumn && col.key === cols[0]?.key && 'sticky left-0 z-10 bg-muted/30')}
                    >
                      <div className="h-5 w-full max-w-[8rem] rounded bg-muted/50 animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={cols.length + (selectable ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground border-border/50"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const rowId = row[keyId] ?? row.id
                return (
                  <TableRow
                    key={rowId}
                    className="border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    {selectable && (
                      <TableCell className="border-border/50 w-10">
                        <Checkbox
                          checked={selectedSet.has(rowId)}
                          onCheckedChange={() => toggleRow(rowId)}
                          aria-label="Select row"
                        />
                      </TableCell>
                    )}
                    {cols.map((col, colIndex) => (
                      <TableCell
                        key={col.key}
                        className={cn(
                          'border-border/50',
                          stickyFirstColumn && colIndex === 0 && 'sticky left-0 z-10 bg-muted/30'
                        )}
                      >
                        {renderCell
                          ? renderCell(row, col.key)
                          : row[col.key] != null
                            ? String(row[col.key])
                            : '—'}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {total > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm text-muted-foreground">
            Showing {from}–{to} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page - 1)}
              disabled={!hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page + 1)}
              disabled={!hasNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
