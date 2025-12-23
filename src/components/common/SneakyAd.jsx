import React from 'react';
import { Megaphone, ExternalLink } from 'lucide-react';
import { ADS } from '../../data/mockData';

const SneakyAd = () => {
    const ad = ADS[0];
    return (
        <div className={`mx-2 mb-3 p-3 rounded-xl border ${ad.border} ${ad.bg} relative group cursor-pointer overflow-hidden transition-all hover:scale-[1.02]`}>
            <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg bg-slate-950/50 ${ad.color} shrink-0`}>
                    <Megaphone size={14} />
                </div>
                <div className="min-w-0">
                    <h4 className={`text-xs font-bold ${ad.color} mb-0.5 flex items-center gap-1`}>
                        {ad.title} <ExternalLink size={8} className="opacity-50" />
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-tight truncate">{ad.description}</p>
                </div>
            </div>
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] uppercase font-bold text-slate-500 bg-slate-950/80 px-1 rounded border border-slate-800">Ad</span>
            </div>
            {/* Shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
    );
};

export default SneakyAd;
