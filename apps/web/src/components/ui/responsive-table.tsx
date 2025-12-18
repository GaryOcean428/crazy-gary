import * as React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

// Responsive Table Container
const ResponsiveTableContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'horizontal' | 'vertical' | 'auto'
    scrollable?: boolean
  }
>(({ className, orientation = 'auto', scrollable = true, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  // Auto orientation based on screen size
  const actualOrientation = orientation === 'auto' 
    ? (isMobile ? 'vertical' : 'horizontal')
    : orientation

  return (
    <div
      ref={ref}
      className={cn(
        "w-full",
        // Horizontal scroll container
        actualOrientation === 'horizontal' && scrollable && "overflow-x-auto overscroll-x-contain",
        // Smooth scrolling on touch devices
        isMobile && "[-webkit-overflow-scrolling: touch]",
        // Custom scrollbar styling
        actualOrientation === 'horizontal' && "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
ResponsiveTableContainer.displayName = "ResponsiveTableContainer"

// Responsive Table Component
const ResponsiveTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & {
    variant?: 'default' | 'card' | 'list'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const isMobile = useIsMobile()
  
  // Mobile card layout
  if (isMobile && variant === 'card') {
    return (
      <div
        ref={ref as any}
        className={cn("space-y-4", className)}
        {...props}
      />
    )
  }

  // Mobile list layout
  if (isMobile && variant === 'list') {
    return (
      <div
        ref={ref as any}
        className={cn("divide-y divide-border", className)}
        role="list"
        {...props}
      />
    )
  }

  // Default table layout
  return (
    <table
      ref={ref}
      className={cn(
        "w-full caption-bottom text-sm border-collapse",
        // Responsive table styles
        isMobile ? "text-sm" : "text-base",
        className
      )}
      {...props}
    />
  )
})
ResponsiveTable.displayName = "ResponsiveTable"

// Table Header with responsive behavior
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & {
    hideOnMobile?: boolean
  }
>(({ className, hideOnMobile = false, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      // Responsive hiding
      hideOnMobile && "hidden md:table-cell",
      // Mobile adjustments
      "[&:has([role=checkbox])]:pr-2 sm:[&:has([role=checkbox])]:pr-4",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

// Table Body with responsive behavior
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

// Table Row with responsive behavior
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    clickable?: boolean
  }
>(({ className, clickable = false, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      // Touch-friendly interaction
      clickable && "cursor-pointer touch-manipulation active:bg-muted/70",
      // Mobile row spacing
      "data-[mobile-stack=true]:flex data-[mobile-stack=true]:flex-col data-[mobile-stack=true]:space-y-2 data-[mobile-stack=true]:py-4",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

// Table Cell with responsive behavior
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    hideOnMobile?: boolean
    priority?: 'high' | 'medium' | 'low'
  }
>(({ className, hideOnMobile = false, priority = 'medium', ...props }, ref) => {
  const isMobile = useIsMobile()
  
  return (
    <td
      ref={ref}
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0",
        // Priority-based hiding on mobile
        isMobile && priority === 'low' && "hidden",
        isMobile && priority === 'medium' && hideOnMobile && "hidden sm:table-cell",
        // Mobile adjustments
        "[&:has([role=checkbox])]:pr-2 sm:[&:has([role=checkbox])]:pr-4",
        // Stack vertically on mobile
        isMobile && "block border-b border-border/50 last:border-b-0 pb-2",
        className
      )}
      {...props}
    />
  )
})
TableCell.displayName = "TableCell"

// Table Caption for accessibility
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

// Mobile Card Item for card layout
const TableCardItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string
    subtitle?: string
    action?: React.ReactNode
  }
>(({ className, title, subtitle, action, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-card rounded-lg border p-4 space-y-3 shadow-sm",
      "hover:shadow-md transition-shadow",
      className
    )}
    role="listitem"
    {...props}
  >
    {(title || subtitle || action) && (
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-sm font-semibold text-foreground truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0 ml-2">
            {action}
          </div>
        )}
      </div>
    )}
    {children && (
      <div className="space-y-2">
        {children}
      </div>
    )}
  </div>
))
TableCardItem.displayName = "TableCardItem"

// Mobile List Item for list layout
const TableListItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string
    subtitle?: string
    icon?: React.ReactNode
    action?: React.ReactNode
    badge?: React.ReactNode
  }
>(({ className, title, subtitle, icon, action, badge, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between py-3 px-2 touch-manipulation",
      "hover:bg-muted/50 active:bg-muted/70",
      "transition-colors",
      className
    )}
    role="listitem"
    {...props}
  >
    <div className="flex items-center space-x-3 flex-1 min-w-0">
      {icon && (
        <div className="flex-shrink-0 text-muted-foreground">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-medium text-foreground truncate">
            {title}
          </p>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">
            {subtitle}
          </p>
        )}
      </div>
      {badge && (
        <div className="flex-shrink-0">
          {badge}
        </div>
      )}
    </div>
    {action && (
      <div className="flex-shrink-0 ml-2">
        {action}
      </div>
    )}
  </div>
))
TableListItem.displayName = "TableListItem"

// Table Column Definition for responsive behavior
const TableColumn = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & {
    colSpan?: number
    rowSpan?: number
    hideOnMobile?: boolean
    priority?: 'high' | 'medium' | 'low'
    width?: string
  }
>(({ className, hideOnMobile = false, priority = 'medium', width, children, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "px-4 py-3 text-left font-semibold text-foreground bg-muted/30",
      // Responsive behavior
      hideOnMobile && "hidden md:table-cell",
      isMobile && priority === 'low' && "hidden",
      isMobile && priority === 'medium' && "hidden sm:table-cell",
      // Width constraints
      width && `[&]:w-[${width}]`,
      className
    )}
    {...props}
  >
    {children}
  </th>
))
TableColumn.displayName = "TableColumn"

// Utility function to create responsive table data
const createResponsiveTableData = (data: any[], columns: any[]) => {
  return data.map((row, index) => {
    const responsiveRow: any = { id: row.id || index }
    
    columns.forEach((column, colIndex) => {
      const key = column.key || `col_${colIndex}`
      responsiveRow[key] = {
        value: row[key] || row[column.dataIndex] || '',
        priority: column.priority || 'medium',
        hideOnMobile: column.hideOnMobile || false,
        className: column.className || '',
        render: column.render || ((value: any) => value)
      }
    })
    
    return responsiveRow
  })
}

export {
  ResponsiveTableContainer,
  ResponsiveTable,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableCaption,
  TableCardItem,
  TableListItem,
  TableColumn,
  createResponsiveTableData,
}