import { forwardRef } from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-2.5 py-1 text-body-xs font-medium',
      md: 'px-4 py-2 text-body-sm font-medium',
      lg: 'px-5 py-2.5 text-body-md font-semibold',
    }[size];

    const variantClasses = {
      primary:
        'bg-accent-blue text-canvas-base hover:bg-accent-blue/90 font-semibold shadow-sm',
      secondary:
        'bg-surface-elevated text-text-primary border border-border hover:bg-surface-hover hover:border-text-muted/40',
      ghost:
        'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-elevated',
      danger:
        'bg-accent-error/10 text-accent-error border border-accent-error/30 hover:bg-accent-error/20',
      accent:
        'bg-accent-amber text-canvas-base hover:bg-accent-amber/90 font-semibold',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent-blue/40 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
