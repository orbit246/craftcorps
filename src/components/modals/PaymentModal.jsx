import React, { useEffect, useRef, useState } from 'react';
import { X, ShieldCheck, Lock } from 'lucide-react';
import { Fungies } from '@fungies/fungies-js';

const PaymentModal = ({ isOpen, onClose, sessionId, publicKey, productName, price, checkoutUrl }) => {
    const containerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen || !checkoutUrl) return;

        setIsLoading(true);
        setError(null);

        const initCheckout = async () => {
            try {
                // Initialize Fungies SDK
                Fungies.Initialize({
                    token: publicKey,
                    enableDataAttributes: false
                });

                if (containerRef.current) {
                    // Clear previous content
                    containerRef.current.innerHTML = '';

                    // Open the checkout in embed mode
                    Fungies.Checkout.open({
                        checkoutUrl: checkoutUrl,
                        settings: {
                            mode: 'embed',
                            frameTarget: 'fungies-checkout-container'
                        }
                    });
                }
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to initialize payment:', err);
                setError('Could not load secure checkout. Please try again.');
                setIsLoading(false);
            }
        };

        // Small delay to ensure DOM is ready and transition is done
        const timer = setTimeout(initCheckout, 100);

        return () => {
            clearTimeout(timer);
            // Close the checkout when modal closes
            try {
                Fungies.Checkout.close();
            } catch (e) {
                // Ignore errors when closing
            }
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [isOpen, checkoutUrl, publicKey]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-950/50">
                    <div className="flex items-center gap-2 text-slate-200">
                        <Lock size={16} className="text-emerald-500" />
                        <span className="font-medium text-sm">Secure Checkout</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="bg-slate-900 min-h-[400px] relative">

                    {/* Loading State */}
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3 z-10 bg-slate-900">
                            <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                            <span className="text-sm">Connecting to secure gateway...</span>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-red-400 gap-3 z-10 bg-slate-900">
                            <ShieldCheck size={48} className="text-red-500/50 mb-2" />
                            <span className="font-bold">Checkout Error</span>
                            <span className="text-sm opacity-80">{error}</span>
                            <button
                                onClick={onClose}
                                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-medium text-sm transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}

                    {/* Embed Container */}
                    <div
                        id="fungies-checkout-container"
                        ref={containerRef}
                        className="w-full h-full min-h-[500px]"
                    />

                </div>

                {/* Footer */}
                <div className="p-3 bg-slate-950/80 border-t border-white/5 flex justify-center">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        <ShieldCheck size={12} />
                        Powered by Fungies.io
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PaymentModal;
