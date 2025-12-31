import React, { useEffect, useState } from 'react';
import { X, AlertOctagon, FileText, FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CrashReportModal = ({ isOpen, onClose, crashData }) => {
    const { t } = useTranslation();
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAnimate(true);
        } else {
            setAnimate(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOpenReport = () => {
        if (crashData?.crashReport && window.electronAPI) {
            window.electronAPI.openPath(crashData.crashReport);
        }
    };

    const handleOpenFolder = () => {
        if (window.electronAPI) {
            // If we have a report path, opening its folder is nice, otherwise logs folder?
            // Or instance folder? For now let's just open logs folder if no specific report, 
            // but user specifically typically looks at crash-reports.
            // If crashReport exists, we can try to open the generic folder? 
            // shell.showItemInFolder(crashData.crashReport) would be done by backend if we implemented it, 
            // but 'openPath' opens the file. 
            // Let's stick to "Open Crash Report" file.
            // Maybe "Open Logs" generic fallback?
            window.electronAPI.openLogsFolder();
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-md bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-red-500/20 bg-red-500/10">
                    <h3 className="font-bold text-red-100 flex items-center gap-2">
                        <AlertOctagon size={22} className="text-red-500" />
                        {t('crash_title', 'Game Crashed')}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-red-300/50 hover:text-red-100 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="text-center mb-6">
                        <p className="text-slate-300 mb-2">
                            {t('crash_message', 'The game exited unexpectedly with code')} <span className="font-mono text-red-400 bg-red-900/20 px-1.5 py-0.5 rounded">{crashData?.code}</span>.
                        </p>
                        <p className="text-sm text-slate-500">
                            {crashData?.crashReport
                                ? t('crash_report_found', 'A crash report was generated. You can view it to debug the issue.')
                                : t('crash_no_report', 'No specific crash report file was detected in the valid logs, but you can check the logs folder.')}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        {crashData?.crashReport && (
                            <button
                                onClick={handleOpenReport}
                                className="w-full px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-red-900/20 flex items-center justify-center gap-2"
                            >
                                <FileText size={18} />
                                {t('btn_open_crash_report', 'Open Crash Report')}
                            </button>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleOpenFolder}
                                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-medium transition-colors border border-slate-700"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <FolderOpen size={16} />
                                    <span>{t('btn_open_logs', 'Open Logs Folder')}</span>
                                </div>
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors border border-slate-700"
                            >
                                {t('btn_ok', 'OK')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrashReportModal;
