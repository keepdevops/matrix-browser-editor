import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'swarm-btn inline-flex items-center justify-center font-medium transition-all duration-200 rounded-2xl border whitespace-nowrap active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
  {
    variants: {
      variant: {
        default:     'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white focus-visible:ring-white/30',
        primary:     'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-black border-emerald-400 font-semibold focus-visible:ring-emerald-400',
        secondary:   'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-blue-500 focus-visible:ring-blue-400',
        warning:     'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-black border-orange-400 focus-visible:ring-orange-400',
        destructive: 'bg-red-500/80 hover:bg-red-600 text-white border-red-500/50 focus-visible:ring-red-400',
      },
      size: {
        default: 'h-9 px-5 text-sm min-w-[80px]',
        sm:      'h-8 px-4 text-xs min-w-[60px]',
        icon:    'h-9 w-9 p-0 min-w-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = ({ variant, size, className, ...props }: ButtonProps) => (
  <button className={buttonVariants({ variant, size, className })} {...props} />
);

export { buttonVariants };
