import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { LoadingSpinner } from "./loading-spinner"
import { cn } from "@/lib/utils"

const enhancedButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft hover:shadow-medium",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-soft hover:shadow-medium",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-soft hover:shadow-medium",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-success text-white hover:bg-success/90 shadow-soft hover:shadow-medium",
        warning: "bg-warning text-white hover:bg-warning/90 shadow-soft hover:shadow-medium",
        info: "bg-info text-white hover:bg-info/90 shadow-soft hover:shadow-medium",
        gradient: "bg-gradient-to-r from-golf-green to-golf-fairway text-white hover:from-golf-green/90 hover:to-golf-fairway/90 shadow-soft hover:shadow-medium",
        glass: "glass text-foreground hover:bg-background/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
        'icon-sm': "h-8 w-8 rounded-lg",
        'icon-lg': "h-12 w-12 rounded-xl",
        'icon-xl': "h-14 w-14 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading

    const sizeClass = size?.includes('icon') ? size : undefined
    const spinnerSize = sizeClass?.includes('sm') ? 'sm' :
                       sizeClass?.includes('lg') ? 'default' :
                       sizeClass?.includes('xl') ? 'lg' : 'sm'

    return (
      <Comp
        className={cn(enhancedButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size={spinnerSize} variant="current" />
          </div>
        )}

        {/* Button Content */}
        <div className={cn(
          "flex items-center justify-center space-x-2",
          loading && "opacity-0"
        )}>
          {leftIcon && !size?.includes('icon') && (
            <span className="shrink-0">
              {leftIcon}
            </span>
          )}

          {!size?.includes('icon') && (
            <span>
              {loading && loadingText ? loadingText : children}
            </span>
          )}

          {size?.includes('icon') && !loading && children}

          {rightIcon && !size?.includes('icon') && (
            <span className="shrink-0">
              {rightIcon}
            </span>
          )}
        </div>

        {/* Ripple effect placeholder */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-150 group-active:opacity-100" />
        </div>
      </Comp>
    )
  }
)

EnhancedButton.displayName = "EnhancedButton"

export { EnhancedButton, enhancedButtonVariants }