import React from 'react';
import { X, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import InstanceIcon from '../../common/InstanceIcon';

export const CropHeader = ({ editingCrop, name, onImport, isImporting, onClose }) => {
    const { t } = useTranslation();
    return (
        <div className="shrink-0 p-6 pb-4 flex justify-between items-center relative z-10">
            <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                    <InstanceIcon instance={editingCrop || { name: name || 'New Crop' }} size={40} />
                </div>
                {editingCrop ? t('crop_title_edit', 'Edit Instance') : t('crop_title_new', 'Create Instance')}
            </h3>
            <div className="flex items-center gap-2">
                {!editingCrop && (
                    <button
                        type="button"
                        onClick={onImport}
                        disabled={isImporting}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 hover:text-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                        title="Import from Folder"
                    >
                        <Download size={14} /> Import
                    </button>
                )}
                <button onClick={onClose} disabled={isImporting} className="text-slate-500 hover:text-slate-200 transition-colors disabled:opacity-50">
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};
