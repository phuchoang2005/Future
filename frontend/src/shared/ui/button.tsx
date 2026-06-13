import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-3.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "border-transparent bg-primary text-white hover:bg-primary-hover focus-visible:outline-primary",
        secondary: "border-border bg-muted text-foreground hover:bg-card focus-visible:outline-primary",
        ghost: "border-transparent bg-transparent text-foreground hover:bg-muted focus-visible:outline-primary",
        danger: "border-destructive/60 bg-destructive/10 text-destructive hover:bg-destructive/15 focus-visible:outline-destructive",
      },
      size: {
        default: "min-h-11 px-3.5",
        icon: "h-11 w-11 px-0",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
