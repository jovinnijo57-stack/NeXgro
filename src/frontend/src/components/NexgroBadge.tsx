// Badge utility component used across NeXgro
import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

export const nexgroBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border border-primary/20",
        success: "bg-primary/10 text-primary border border-primary/20",
        warning: "bg-accent/10 text-accent border border-accent/20",
        destructive:
          "bg-destructive/10 text-destructive border border-destructive/20",
        muted: "bg-muted text-muted-foreground border border-border",
        outline: "border border-border text-foreground bg-transparent",
        flash: "flash-deal-banner border-0",
        new: "bg-primary text-primary-foreground border-0",
      },
      size: {
        sm: "text-[10px] px-2 py-0.5",
        md: "text-xs px-2.5 py-1",
        lg: "text-sm px-3 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

interface NexgroBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof nexgroBadgeVariants> {
  dot?: boolean;
}

export function NexgroBadge({
  className,
  variant,
  size,
  dot,
  children,
  ...props
}: NexgroBadgeProps) {
  return (
    <span
      className={cn(nexgroBadgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "success" && "bg-primary",
            variant === "warning" && "bg-accent",
            variant === "destructive" && "bg-destructive",
            variant === "muted" && "bg-muted-foreground",
            !variant && "bg-primary",
          )}
        />
      )}
      {children}
    </span>
  );
}
