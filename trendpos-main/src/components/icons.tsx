import React from 'react';
import { cn } from '@/lib/utils';

export const Icons = {
  logo: ({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      src="/logo.png"
      alt="USDT STORE Logo"
      className={cn("h-12 w-auto object-contain drop-shadow-md transition-transform hover:scale-105", className)}
      {...props}
    />
  ),
};
