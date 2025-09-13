import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react"

export interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  success?: string
  helperText?: string
  showPasswordToggle?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({
    className,
    type,
    error,
    success,
    helperText,
    showPasswordToggle,
    leftIcon,
    rightIcon,
    disabled,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)

    const inputType = type === "password" && showPassword ? "text" : type

    const hasError = Boolean(error)
    const hasSuccess = Boolean(success)
    const hasLeftIcon = Boolean(leftIcon)
    const hasRightIcon = Boolean(rightIcon) || showPasswordToggle

    return (
      <div className="w-full">
        <div className="relative">
          {/* Left Icon */}
          {hasLeftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <div className={cn(
                "text-muted-foreground transition-colors duration-200",
                isFocused && "text-golf-green",
                hasError && "text-destructive",
                hasSuccess && "text-success"
              )}>
                {leftIcon}
              </div>
            </div>
          )}

          {/* Input Field */}
          <input
            type={inputType}
            className={cn(
              "flex h-12 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm transition-all duration-200 ease-out",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "hover:border-border/80",
              hasLeftIcon && "pl-11",
              hasRightIcon && "pr-11",
              isFocused && "border-golf-green shadow-soft",
              hasError && "border-destructive focus-visible:ring-destructive",
              hasSuccess && "border-success focus-visible:ring-success",
              disabled && "bg-muted hover:border-input",
              className
            )}
            ref={ref}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          />

          {/* Right Side Icons */}
          {hasRightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <div className="flex items-center space-x-1">
                {/* Status Icons */}
                {hasError && (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                {hasSuccess && (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                )}

                {/* Custom Right Icon */}
                {rightIcon && !showPasswordToggle && (
                  <div className={cn(
                    "text-muted-foreground transition-colors duration-200",
                    isFocused && "text-golf-green"
                  )}>
                    {rightIcon}
                  </div>
                )}

                {/* Password Toggle */}
                {showPasswordToggle && type === "password" && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={cn(
                      "text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus:text-golf-green",
                      disabled && "cursor-not-allowed opacity-50"
                    )}
                    disabled={disabled}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Helper Text/Error/Success Messages */}
        {(error || success || helperText) && (
          <div className="mt-2 space-y-1">
            {error && (
              <p className="text-sm text-destructive flex items-center space-x-1">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </p>
            )}
            {success && !error && (
              <p className="text-sm text-success flex items-center space-x-1">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </p>
            )}
            {helperText && !error && !success && (
              <p className="text-sm text-muted-foreground">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

EnhancedInput.displayName = "EnhancedInput"

export { EnhancedInput }