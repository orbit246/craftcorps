import React from 'react';
import { Save, Plus, Trash2, FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const CropFooter = ({ editingCrop, onCancel, onDelete, onOpenFolder }) => {
    const { t } = useTranslation();
    return (
        <div className="shrink-0 p-6 pt-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md">
            <div className="flex gap-3">
                {editingCrop && (
                    <>
                        <button
                            type="button"
                            onClick={onDelete}
                            className="px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                            title="Delete Crop"
                        >
                            <Trash2 size={20} />
                        </button>
                        {editingCrop.path && (
                            <button
                                type="button"
                                onClick={onOpenFolder}
                                className="px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors flex items-center gap-2"
                                title={t('crop_btn_open_folder', { defaultValue: 'Open Folder' })}
                            >
                                <FolderOpen size={20} />
                            </button>
                        )}
                    </>
                )}
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-colors"
                >
                    {t('btn_cancel')}
                </button>
                <button
                    type="submit"
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {editingCrop ? <Save size={18} /> : <Plus size={18} />}
                    {editingCrop ? t('crop_btn_save_edit') : t('crop_btn_save_new')}
                </button>
            </div>
        </div>
    );
};
