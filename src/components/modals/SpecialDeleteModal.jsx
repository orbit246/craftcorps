import React from 'react';
import { ShieldAlert, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SpecialDeleteModal = ({ isOpen, onClose, onConfirm, onNewInstance }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-white/10 rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 mx-auto">
                        <ShieldAlert size={32} />
                    </div>

                    <h3 className="text-2xl font-bold text-white text-center mb-3">Wait! That's a Special Instance</h3>
                    <p className="text-slate-400 text-center text-sm leading-relaxed mb-8">
                        The <strong>CraftCorps Client</strong> is specifically pre-configured with performance mods and launcher optimizations.
                        If you want a fresh start, we recommend <strong>creating a new instance</strong> instead of deleting this one.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                onNewInstance();
                                onClose();
                            }}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                        >
                            <Plus size={20} />
                            Create New Instance
                        </button>

                        <div className="h-px bg-white/5 my-2" />

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition-all"
                            >
                                Keep It
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="flex-1 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} />
                                Delete Anyway
                            </button>
                        </div>
                    </div>
                </div>

                {/* Visual Accent */}
                <div className="h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500" />
            </div>
        </div>
    );
};

export default SpecialDeleteModal;
