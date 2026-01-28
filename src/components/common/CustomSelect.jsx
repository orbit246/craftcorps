import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, disabled, loading, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const [scrollTop, setScrollTop] = useState(0);

    const ITEM_HEIGHT = 36; // px-4 py-2 text-sm ~ derived height
    const DROPDOWN_MAX_HEIGHT = 220;

    const toggleOpen = () => {
        if (disabled || loading) return;

        if (isOpen) {
            setIsOpen(false);
            return;
        }

        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 8,
                left: rect.left,
                width: rect.width
            });
            setIsOpen(true);
            setScrollTop(0);
        }
    };

    // Handle closing on click outside or scroll
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (triggerRef.current && !triggerRef.current.contains(e.target) && !e.target.closest('.custom-select-dropdown')) {
                setIsOpen(false);
            }
        };
        const handleScroll = (e) => {
            if (e.target.classList?.contains('custom-select-dropdown')) return;
            if (isOpen) setIsOpen(false);
        };

        if (isOpen) {
            window.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
        }
        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [isOpen]);

    const selectedOption = options.find(o => o.value === value);

    // Virtualization Calculations
    const totalHeight = options.length * ITEM_HEIGHT;
    const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
    const visibleCount = Math.ceil(DROPDOWN_MAX_HEIGHT / ITEM_HEIGHT);
    // Add buffer of 2 items above and below
    const renderStart = Math.max(0, startIndex - 2);
    const renderEnd = Math.min(options.length, startIndex + visibleCount + 2);

    const visibleOptions = [];
    if (options.length > 0) {
        for (let i = renderStart; i < renderEnd; i++) {
            visibleOptions.push({ ...options[i], index: i });
        }
    }

    return (
        <>
            <div
                ref={triggerRef}
                onClick={toggleOpen}
                className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-slate-200 flex items-center justify-between transition-colors cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed border-slate-800' :
                    isOpen ? 'border-emerald-500' : 'border-slate-800 hover:border-slate-700'
                    }`}
            >
                <span className={`truncate ${!selectedOption && !loading ? 'text-slate-500' : ''}`}>
                    {loading ? 'Loading...' : (selectedOption ? selectedOption.label : placeholder || 'Select...')}
                </span>
                <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && createPortal(
                <div
                    className="custom-select-dropdown fixed z-[9999] bg-slate-900 border border-slate-700 rounded-xl custom-scrollbar shadow-2xl animate-in fade-in zoom-in-95 duration-100"
                    style={{
                        top: coords.top,
                        left: coords.left,
                        width: coords.width,
                        maxHeight: `${DROPDOWN_MAX_HEIGHT}px`,
                        height: options.length > 0 ? (totalHeight > DROPDOWN_MAX_HEIGHT ? `${DROPDOWN_MAX_HEIGHT}px` : `${totalHeight}px`) : 'auto',
                        overflowY: 'auto'
                    }}
                    onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
                >
                    {options.length > 0 ? (
                        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
                            {visibleOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => {
                                        if (!option.disabled) {
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }
                                    }}
                                    className={`absolute left-0 w-full px-4 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between select-none box-border ${option.disabled ? 'opacity-50 cursor-not-allowed text-slate-600' :
                                        option.value === value ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-slate-300 hover:bg-white/5'
                                        }`}
                                    style={{
                                        top: `${option.index * ITEM_HEIGHT}px`,
                                        height: `${ITEM_HEIGHT}px`
                                    }}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {option.value === value && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 ml-2" />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-3 text-sm text-slate-500 text-center">No options</div>
                    )}
                </div>,
                document.body
            )}
        </>
    );
};

export default CustomSelect;
