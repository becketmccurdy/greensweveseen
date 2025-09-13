import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const spinnerVariants = cva(
  "animate-spin rounded-full border-2 border-current border-t-transparent",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        default: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
      variant: {
        default: "text-muted-foreground",
        primary: "text-golf-green",
        white: "text-white",
        current: "text-current",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, label, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center", className)}
        {...props}
      >
        <div
          className={cn(spinnerVariants({ size, variant }))}
          role="status"
          aria-label={label || "Loading"}
        >
          <span className="sr-only">{label || "Loading"}</span>
        </div>
      </div>
    )
  }
)

LoadingSpinner.displayName = "LoadingSpinner"

// Full page loading overlay
interface LoadingOverlayProps {
  isLoading?: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading = false,
  children,
  loadingText = "Loading...",
  className
}) => {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" variant="primary" />
            <p className="text-sm text-muted-foreground font-medium">{loadingText}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Skeleton loading components
const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "animate-pulse rounded-lg bg-muted/60",
        className
      )}
      {...props}
    />
  )
})
Skeleton.displayName = "Skeleton"

export { LoadingSpinner, LoadingOverlay, Skeleton, spinnerVariants }