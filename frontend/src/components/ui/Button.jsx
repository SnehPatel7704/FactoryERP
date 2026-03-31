import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'px-6 py-2 transition-colors rounded text-sm uppercase tracking-wider';
  
  const variants = {
    primary: 'bg-secondary text-surface-container-lowest hover:bg-secondary-fixed-dim font-black shadow-[0_0_15px_rgba(0,200,83,0.3)]',
    secondary: 'border border-outline text-on-surface-variant hover:bg-surface-variant font-semibold',
    danger: 'bg-error/10 text-error hover:bg-error/20 border border-error/50 font-semibold',
    ghost: 'text-on-surface-variant hover:text-secondary hover:bg-secondary/10 font-semibold'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
