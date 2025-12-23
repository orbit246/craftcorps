import React from 'react';
import { HardDrive } from 'lucide-react';

const ModsView = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800">
                <HardDrive size={32} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-medium text-slate-300">Mod Vault</h3>
            <p className="max-w-md text-center text-sm">Search and install mods directly from here. Feature coming soon.</p>
        </div>
    );
};

export default ModsView;
