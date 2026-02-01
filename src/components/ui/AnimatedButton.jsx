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
    primary: "bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-200 hover:shadow-xl hover:shadow-sky-300",
    secondary: "bg-white border-2 border-slate-200 text-slate-700 hover:border-sky-300 hover:text-sky-600",
    gold: "bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
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