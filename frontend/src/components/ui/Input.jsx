import React from 'react';

const Input = ({ label, id, className = '', containerClassName = '', ...props }) => {
  const baseInputStyles = 'w-full px-4 py-3 rounded text-sm transition-all focus:ring-0 border';
  
  const readOnlyStyles = props.readOnly 
    ? 'bg-surface-container-highest/30 border-outline text-on-surface-variant cursor-not-allowed font-mono'
    : 'bg-surface-container-highest border-outline text-on-surface focus:border-secondary placeholder:text-on-surface-variant/50';

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`${baseInputStyles} ${readOnlyStyles} ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
