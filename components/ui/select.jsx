'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const SelectContext = createContext(null);

export function Select({ 
  value, 
  onValueChange, 
  defaultValue, 
  children, 
  disabled = false 
}) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value || defaultValue || '');
  const [displayMap, setDisplayMap] = useState({});
  const containerRef = useRef(null);

  const currentValue = value !== undefined ? value : internalValue;

  const handleSelect = (val) => {
    if (value === undefined) {
      setInternalValue(val);
    }
    if (onValueChange) {
      onValueChange(val);
    }
    setOpen(false);
  };

  const registerItem = (val, label) => {
    setDisplayMap(prev => {
      if (prev[val] === label) return prev;
      return { ...prev, [val]: label };
    });
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <SelectContext.Provider 
      value={{ 
        open, 
        setOpen, 
        value: currentValue, 
        handleSelect, 
        registerItem,
        displayMap,
        disabled
      }}
    >
      <div ref={containerRef} className="relative inline-block w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ 
  className = '', 
  children, 
  id,
  hideChevron = false,
  ...props 
}) {
  const { open, setOpen, disabled } = useContext(SelectContext);

  return (
    <button
      type="button"
      id={id}
      disabled={disabled}
      onClick={() => setOpen(!open)}
      className={cn(
        'w-full flex items-center justify-between py-3.5 px-4 bg-white text-gray-900 border-2 border-gray-300 hover:border-[#1F4072] rounded-2xl shadow-sm text-sm sm:text-base font-normal transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1F4072]',
        open && 'border-[#1F4072] ring-2 ring-[#1F4072]/20',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      <div className={cn('flex-1 text-left min-w-0', !hideChevron && 'truncate mr-2')}>
        {children}
      </div>
      {!hideChevron && (
        <ChevronDown 
          className={cn(
            'w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200',
            open && 'rotate-180 text-[#1F4072]'
          )} 
        />
      )}
    </button>
  );
}

export function SelectValue({ placeholder = 'Select an option', className = '' }) {
  const { value, displayMap } = useContext(SelectContext);
  const displayText = displayMap[value] || value;

  return (
    <span className={cn('block truncate', !value && 'text-gray-400 font-normal', className)}>
      {displayText || placeholder}
    </span>
  );
}

export function SelectContent({ className = '', children, ...props }) {
  const { open } = useContext(SelectContext);

  if (!open) return null;

  return (
    <div
      className={cn(
        'absolute left-0 right-0 z-[9999] mt-2 bg-white rounded-2xl border-2 border-[#1F4072] shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-150 overflow-hidden',
        className
      )}
      style={{
        boxShadow: '0 20px 50px -10px rgba(31, 64, 114, 0.35)',
        zIndex: 9999
      }}
      {...props}
    >
      <ScrollArea className="max-h-48 sm:max-h-56 w-full" type="always">
        <div className="space-y-1 p-1 pr-2.5">
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}

export function SelectItem({ 
  value, 
  children, 
  className = '', 
  disabled = false,
  ...props 
}) {
  const { value: selectedValue, handleSelect, registerItem } = useContext(SelectContext);
  const isSelected = selectedValue === value;

  useEffect(() => {
    if (typeof children === 'string') {
      registerItem(value, children);
    }
  }, [value, children]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => handleSelect(value)}
      className={cn(
        'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-normal transition-colors text-left cursor-pointer select-none',
        isSelected 
          ? 'bg-[#1F4072] text-white shadow-sm font-medium' 
          : 'text-gray-800 hover:bg-[#1F4072]/10 hover:text-[#1F4072]',
        disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent text-gray-400',
        className
      )}
      {...props}
    >
      <span className="truncate pr-2">{children}</span>
      {isSelected && (
        <Check className="w-4 h-4 text-[#93B4E4] shrink-0" />
      )}
    </button>
  );
}

export function SelectGroup({ children, className = '' }) {
  return <div className={cn('p-1', className)}>{children}</div>;
}

export function SelectLabel({ children, className = '' }) {
  return (
    <div className={cn('px-3.5 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider', className)}>
      {children}
    </div>
  );
}

export function SelectSeparator({ className = '' }) {
  return <div className={cn('h-px bg-gray-100 my-1', className)} />;
}
