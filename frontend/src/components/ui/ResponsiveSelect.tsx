import React, { useEffect, useMemo, useRef, useState } from 'react';

type Option = { value: string; label: string };

type ResponsiveSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  menuZIndex?: number;
  id?: string;
  name?: string;
};

export default function ResponsiveSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'בחרי',
  disabled = false,
  className = '',
  menuZIndex = 60,
  id,
  name
}: ResponsiveSelectProps) {
  const [open, setOpen] = useState(false);
  const current = useMemo(() => options.find(o => String(o.value) === String(value)), [options, value]);
  const labelId = useMemo(() => `${id || name || 'rs'}-label`, [id, name]);
  const listboxId = useMemo(() => `${id || name || 'rs'}-listbox`, [id, name]);
  const firstOptionRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open) {
      // Focus first option for accessibility
      const timeout = setTimeout(() => {
        firstOptionRef.current?.focus();
      }, 0);
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          setOpen(false);
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => {
        clearTimeout(timeout);
        window.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [open]);

  const handleKeyNav = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    const container = e.currentTarget;
    const focusable = Array.from(container.querySelectorAll<HTMLButtonElement>('button[role="option"]'));
    const index = focusable.findIndex(el => el === document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = focusable[Math.min(focusable.length - 1, index + 1)] || focusable[0];
      next?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = focusable[Math.max(0, index - 1)] || focusable[focusable.length - 1];
      prev?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusable[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      focusable[focusable.length - 1]?.focus();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop / tablet: native select for best a11y */}
      <div className="hidden sm:block">
        <label id={labelId} htmlFor={id} className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">{label}</label>
        <select
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-labelledby={labelId}
          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none disabled:opacity-50"
        >
          {!value && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Mobile: custom modal-like listbox */}
      <div className="sm:hidden">
        <label id={`${labelId}-mobile`} className="block text-xs font-medium text-[#4B2E83] mb-1">{label}</label>
        <button
          type="button"
          onClick={() => !disabled && setOpen(true)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-labelledby={`${labelId}-mobile`}
          disabled={disabled}
          className="w-full px-3 py-2 text-xs border border-[#EC4899]/20 rounded-lg flex items-center justify-between disabled:opacity-50"
        >
          <span className="truncate text-[#4B2E83]">{current?.label || placeholder}</span>
          <svg className="w-4 h-4 text-[#4B2E83]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="fixed inset-0" style={{ zIndex: menuZIndex }}>
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${listboxId}-title`}
              className="absolute left-1/2 -translate-x-1/2 top-[20%] w-[92vw] max-w-sm bg-white rounded-xl shadow-2xl border border-[#EC4899]/20 overflow-hidden"
            >
              <div id={`${listboxId}-title`} className="px-3 py-2 border-b border-gray-100 text-[#4B2E83] text-sm font-semibold text-center">
                {label}
              </div>
              <div
                id={listboxId}
                role="listbox"
                aria-labelledby={`${listboxId}-title`}
                className="max-h-[50vh] overflow-y-auto p-2"
                onKeyDown={handleKeyNav}
              >
                {options.map((opt, idx) => {
                  const selected = String(opt.value) === String(value);
                  const ref = idx === 0 ? firstOptionRef : undefined;
                  return (
                    <button
                      key={opt.value}
                      ref={ref as any}
                      role="option"
                      aria-selected={selected}
                      onClick={() => { onChange(opt.value); setOpen(false); }}
                      className={`w-full text-right px-3 py-2 rounded-lg text-sm mb-1 border ${selected ? 'bg-[#EC4899]/10 border-[#EC4899]/30 text-[#4B2E83] font-medium' : 'border-transparent hover:bg-gray-50 text-[#4B2E83]/90'}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <div className="p-2 border-t border-gray-100">
                <button onClick={() => setOpen(false)} className="w-full px-3 py-2 text-sm rounded-lg border text-[#4B2E83]">
                  סגור
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


