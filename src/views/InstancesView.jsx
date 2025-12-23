import React from 'react';
import { Sprout, Edit3, Trash2, Plus } from 'lucide-react';

const InstancesView = ({ instances, onEditCrop, onDeleteCrop, onSelectInstance, onNewCrop }) => {
    return (
        <div className="flex-1 overflow-y-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Manage Crops</h2>
                    <p className="text-slate-400 text-sm">Configure, update, or plant new instances.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 w-64"
                    />
                    <button
                        onClick={onNewCrop}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
                    >
                        <Plus size={18} /> New Crop
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {instances.map(inst => (
                    <div
                        key={inst.id}
                        className="group bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-600 transition-all relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className={`w-12 h-12 rounded-lg ${inst.iconColor} flex items-center justify-center text-slate-900`}>
                                <Sprout size={24} />
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => onEditCrop(inst)}
                                    className="p-1.5 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800"
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button
                                    onClick={() => onDeleteCrop(inst.id)}
                                    className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <h3 className="font-bold text-white truncate relative z-10">{inst.name}</h3>
                        <p className="text-xs text-slate-500 mb-4 relative z-10">{inst.version} • {inst.loader}</p>
                        <button
                            onClick={() => onSelectInstance(inst)}
                            className="w-full py-2 bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-500 font-medium rounded-lg text-sm transition-colors relative z-10"
                        >
                            Select & Play
                        </button>
                        {/* Subtle Gradient BG */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${inst.bgGradient} opacity-10`} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InstancesView;
