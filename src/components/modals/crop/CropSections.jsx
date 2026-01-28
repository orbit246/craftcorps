import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlaskConical } from 'lucide-react';
import CustomSelect from '../../common/CustomSelect';

export const IdentitySection = ({ name, setName, errors, setErrors, t }) => {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t('crop_label_name')} {errors.name && <span className="text-red-500">{t('crop_required')}</span>}
            </label>
            <input
                type="text"
                value={name}
                onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: false }));
                }}
                placeholder="My Awesome World"
                className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors placeholder:text-slate-600 ${errors.name
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-800 focus:border-emerald-500/50'
                    }`}
                autoFocus
            />
        </div>
    );
};

export const VersionSection = ({
    loader,
    handleLoaderChange,
    loaderOptions,
    version,
    handleVersionChange,
    versionOptions,
    loadingVersions,
    includeSnapshots,
    setIncludeSnapshots,
    versions,
    editingCrop,
    errors,
    t
}) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {t('crop_label_loader')}
                </label>
                <CustomSelect
                    value={loader}
                    onChange={handleLoaderChange}
                    options={loaderOptions}
                    disabled={editingCrop && editingCrop.modpackProjectId}
                />
            </div>
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {t('crop_label_version')} {errors.version && <span className="text-red-500">{t('crop_required')}</span>}
                    </label>
                    <button
                        type="button"
                        onClick={() => handleVersionChange(versions[0])}
                        disabled={loadingVersions || (editingCrop && editingCrop.modpackProjectId)}
                        className="text-xs font-bold text-emerald-500 hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('crop_btn_latest')}
                    </button>
                </div>
                <CustomSelect
                    value={version}
                    onChange={handleVersionChange}
                    options={versionOptions}
                    loading={loadingVersions}
                    disabled={loadingVersions || (editingCrop && editingCrop.modpackProjectId)}
                />
                <div className="mt-2 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIncludeSnapshots(!includeSnapshots)}
                        className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${includeSnapshots ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-400'
                            }`}
                    >
                        <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-colors ${includeSnapshots ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
                            }`}>
                            {includeSnapshots && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        {t('crop_enable_snapshots', { defaultValue: 'Enable Snapshots' })}
                        <FlaskConical size={12} className={includeSnapshots ? 'text-emerald-500' : 'text-slate-600'} />
                    </button>
                </div>
            </div>
        </div>
    );
};
