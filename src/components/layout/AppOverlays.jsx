import React from 'react';
import ConsoleOverlay from '../common/ConsoleOverlay';
import LaunchOverlay from '../common/LaunchOverlay';
import LoginModal from '../modals/LoginModal';
import CropModal from '../modals/CropModal';
import JavaInstallModal from '../modals/JavaInstallModal';
import ErrorModal from '../modals/ErrorModal';
import CrashReportModal from '../modals/CrashReportModal';
import UpdateModal from '../modals/UpdateModal';
import SpecialDeleteModal from '../modals/SpecialDeleteModal';
import AccountManagementModal from '../modals/AccountManagementModal';
import MyServersModal from '../modals/MyServersModal';

const AppOverlays = ({
    // Console
    logs, showConsole, setShowConsole,
    // Launch
    launchStatus, launchStep, launchProgress, selectedInstance, handleStop,
    // Login
    showLoginModal, setShowLoginModal, onAddAccountWithToast, isRefreshing,
    // Account Management
    showAccountModal, setShowAccountModal, accounts, activeAccount, onAccountSwitch, onRemoveAccount,
    // Crop
    showCropModal, setShowCropModal, onSaveCropWithToast, editingCrop, onDeleteCropWithToast,
    // Java
    showJavaModal, setShowJavaModal, handleJavaInstallComplete, refreshJavas, requiredJavaVersion,
    // Error
    errorModal, setErrorModal,
    // Crash
    crashModal, setCrashModal,
    // Update
    showUpdateModal, setShowUpdateModal, updateStatus, updateInfo, downloadProgress, onDownloadUpdate, onInstallUpdate,
    instanceCount,
    showSpecialDeleteModal, setShowSpecialDeleteModal, onConfirmSpecialDelete, onNewCrop,
    showServersModal, setShowServersModal
}) => {
    return (
        <>
            <ConsoleOverlay
                logs={logs}
                isOpen={showConsole}
                onClose={() => setShowConsole(false)}
            />

            {/* 
            <LaunchOverlay
                isOpen={launchStatus === 'launching'}
                status={launchStep}
                progress={launchProgress}
                instanceName={selectedInstance?.name}
                onCancel={handleStop}
            /> 
            */}

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onAddAccount={onAddAccountWithToast}
                isAutoRefreshing={isRefreshing}
                accounts={accounts}
            />

            {/* Crop (Edit/Create) Modal */}
            <CropModal
                isOpen={showCropModal}
                onClose={() => setShowCropModal(false)}
                onSave={onSaveCropWithToast}
                editingCrop={editingCrop}
                onDelete={onDeleteCropWithToast}
                instanceCount={instanceCount}
            />

            <JavaInstallModal
                isOpen={showJavaModal}
                onClose={() => setShowJavaModal(false)}
                onInstallComplete={(path) => {
                    handleJavaInstallComplete(path);
                    refreshJavas();
                }}
                version={requiredJavaVersion}
            />

            <ErrorModal
                isOpen={!!errorModal}
                onClose={() => setErrorModal(null)}
                error={errorModal}
            />

            <CrashReportModal
                isOpen={!!crashModal}
                onClose={() => setCrashModal(null)}
                crashData={crashModal}
            />

            <UpdateModal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                updateStatus={updateStatus}
                updateInfo={updateInfo}
                downloadProgress={downloadProgress}
                onDownload={onDownloadUpdate}
                onInstall={onInstallUpdate}
            />

            <SpecialDeleteModal
                isOpen={showSpecialDeleteModal}
                onClose={() => setShowSpecialDeleteModal(false)}
                onConfirm={onConfirmSpecialDelete}
                onNewInstance={onNewCrop}
            />

            <AccountManagementModal
                isOpen={showAccountModal}
                onClose={() => setShowAccountModal(false)}
                accounts={accounts}
                activeAccount={activeAccount}
                onSwitchAccount={(acc) => { onAccountSwitch(acc); setShowAccountModal(false); }}
                onRemoveAccount={onRemoveAccount}
                onAddAccount={() => { setShowLoginModal(true); setShowAccountModal(false); }}
            />

            <MyServersModal
                isOpen={showServersModal}
                onClose={() => setShowServersModal(false)}
            />
        </>
    );
};

export default AppOverlays;
