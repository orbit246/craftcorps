import React from 'react';
import { Sprout } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EmptyState = ({ onNewCrop }) => {
    const { t } = useTranslation();
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <Sprout size={48} className="mb-4 opacity-50" />
            <p>{t('home_no_crops')}</p>
            <button onClick={onNewCrop} className="mt-4 text-emerald-500 hover:underline">
                {t('home_btn_create_first')}
            </button>
        </div>
    );
};

export default EmptyState;
