import React from 'react';

const Select = ({ label, id, options = [], className = '', containerClassName = '', ...props }) => {
  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          id={id}
          className={`w-full bg-surface-container-highest border-outline border text-on-surface px-4 py-3 rounded text-sm focus:border-secondary focus:ring-0 transition-all appearance-none cursor-pointer ${className}`}
          {...props}
        >
          {options.map((option, idx) => (
            <option key={idx} value={option.value || option.label || option}>
              {option.label || option}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none">
          expand_more
        </span>
      </div>
    </div>
  );
};

export default Select;
