import React from 'react';
import { Gamepad2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function WelcomeView({ onConnect, disableAnimations }) {
    const { t } = useTranslation();

    return (
        <div className="flex-1 flex flex-col items-center justify-center relative select-none overflow-hidden">
            {/* Main Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/hero-bg-cc.png"
                    alt=""
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20" />
            </div>

            {/* Content Card - Glossy & Transparent */}
            <div className="relative z-10 w-[clamp(320px,90vw,440px)] p-10 rounded-[3rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-700">

                <div className="relative mb-8 group/icon">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/40 transform group-hover/icon:scale-105 transition-all duration-500">
                        <Gamepad2 size={40} className="text-white drop-shadow-lg" />
                    </div>
                </div>

                <h2 className="text-[clamp(1.75rem,5vw,2.25rem)] font-bold text-white mb-3 tracking-tight drop-shadow-sm">
                    {t('home_welcome_back')}
                </h2>

                <p className="text-slate-300/80 mb-8 leading-relaxed text-sm max-w-[280px]">
                    {t('home_connect_identity')}
                </p>

                <button
                    onClick={onConnect}
                    className="btn-premium-emerald w-full py-5 px-8 rounded-2xl text-white font-extrabold uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-xl shadow-emerald-500/20"
                >
                    <Gamepad2 size={20} strokeWidth={3} />
                    <span>{t('home_btn_connect')}</span>
                </button>
            </div>
        </div>
    );
}

export default WelcomeView;
