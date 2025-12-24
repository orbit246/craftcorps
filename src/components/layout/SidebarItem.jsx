import React from 'react';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${active
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
    >
        <Icon size={20} className={active ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'} />
        <span className="font-medium text-sm pointer-events-none">{label}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />}
    </button>
);

export default SidebarItem;
