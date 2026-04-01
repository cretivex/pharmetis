import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Shared table. Breathable: header muted, rows with bottom separator only, hover transition.
 */
const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto rounded-2xl border border-border/50 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
    <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
  </div>
))
Table.displayName = 'Table'

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('bg-muted/40 [&_tr]:border-b [&_tr]:border-border/50', className)} {...props} />
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn(className)} {...props} />
))
TableBody.displayName = 'TableBody'

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-border/50 transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted',
      className
    )}
    {...props}
  />
))
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 text-left align-middle text-xs uppercase tracking-wide font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('p-4 align-middle text-foreground [&:has([role=checkbox])]:pr-0', className)} {...props} />
))
TableCell.displayName = 'TableCell'

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell }
