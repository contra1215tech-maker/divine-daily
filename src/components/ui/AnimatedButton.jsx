import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

export default function AnimatedButton({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'default',
  icon: Icon,
  disabled = false,
  loading = false,
  className,
  ...props 
}) {
  const variants = {
    primary: "bg-transparent border-2 theme-text-primary hover:bg-white/10",
    secondary: "bg-transparent border-2 theme-text-secondary hover:bg-white/10",
    gold: "bg-transparent border-2 theme-text-primary hover:bg-white/10",
    ghost: "bg-transparent theme-text-secondary hover:bg-white/10",
  };
  
  const sizes = {
    small: "px-4 py-2 text-sm rounded-xl",
    default: "px-6 py-3 text-base rounded-2xl",
    large: "px-8 py-4 text-lg rounded-2xl",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "font-semibold transition-all duration-300 flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
        />
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5" />}
          {children}
        </>
      )}
    </motion.button>
  );
}