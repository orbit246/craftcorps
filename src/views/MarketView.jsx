import React, { useState, useEffect } from 'react';
import { ShoppingBag, Sparkles, Crown, Coins, Palette, Package, Search, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { payments } from '../services/PaymentsService';
import PaymentModal from '../components/modals/PaymentModal';

const CATEGORIES = [
    { id: 'all', name: 'All Items', icon: Package },
    { id: 'ranks', name: 'Ranks', icon: Crown },
    { id: 'currency', name: 'Currency', icon: Coins },
    { id: 'cosmetics', name: 'Cosmetics', icon: Palette },
    { id: 'bundles', name: 'Bundles', icon: Sparkles }
];

const MarketView = () => {
    const { addToast } = useToast();
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Purchase State
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [checkoutData, setCheckoutData] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(null);

    useEffect(() => {
        loadPackages();
    }, []);

    const loadPackages = async () => {
        setIsLoading(true);
        try {
            // For now, use public packages (no auth required)
            // When auth is implemented, use payments.getPackages(authToken) instead
            const data = await payments.getPublicPackages();
            setPackages(data);
        } catch (error) {
            console.error('Failed to load packages:', error);
            addToast('Failed to load market items', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPackages = packages.filter(pkg => {
        const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handlePurchase = async (pkg) => {
        if (isPurchasing) return;

        setIsPurchasing(true);
        setSelectedPackage(pkg);
        addToast(`Starting checkout for ${pkg.name}...`, 'info');

        try {
            // Retrieve auth token if available (using a placeholder for now as authToken logic is in App.jsx/hooks)
            // In a real scenario, we'd pass the auth token from context or props
            const authToken = 'placeholder_token'; // TODO: Get from useAccounts/useAuth

            const session = await payments.createCheckoutSession(pkg.id, authToken);

            setCheckoutData(session);
            setShowPaymentModal(true);
        } catch (error) {
            console.error('Checkout failed:', error);
            addToast(error.message || 'Failed to start checkout process', 'error');
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleClosePayment = () => {
        setShowPaymentModal(false);
        setCheckoutData(null);
        setSelectedPackage(null);
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={handleClosePayment}
                sessionId={checkoutData?.sessionId}
                publicKey={checkoutData?.publicKey}
                productName={selectedPackage?.name}
                price={selectedPackage?.price}
            />

            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600/20 via-slate-900/95 to-slate-900 border-b border-white/5">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-5" />

                <div className="relative z-10 px-8 py-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center ring-2 ring-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                            <ShoppingBag size={32} className="text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-300 tracking-tight">
                                Market
                            </h1>
                            <p className="text-emerald-400/80 text-sm font-medium mt-1">
                                Enhance your adventure with premium items
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-md mt-6">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search items..."
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-950/80 transition-all shadow-inner"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="px-8 py-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        const isActive = selectedCategory === category.id;
                        return (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 whitespace-nowrap
                                    ${isActive
                                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50'
                                    }
                                `}
                            >
                                <Icon size={16} />
                                <span className="text-sm">{category.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Package Grid */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-slate-800/30 rounded-2xl h-80 animate-pulse" />
                        ))}
                    </div>
                ) : filteredPackages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                        <Package size={64} className="text-slate-700 mb-4" />
                        <h3 className="text-xl font-bold text-slate-400 mb-2">No items found</h3>
                        <p className="text-slate-600">Try adjusting your filters or search query</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                        {filteredPackages.map((pkg) => (
                            <PackageCard
                                key={pkg.id}
                                package={pkg}
                                onPurchase={handlePurchase}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const PackageCard = ({ package: pkg, onPurchase }) => {
    const [isHovered, setIsHovered] = useState(false);

    const formatPrice = () => {
        if (pkg.priceSeeds) {
            return `${pkg.priceSeeds} Seeds`;
        }
        if (pkg.price) {
            return `$${pkg.price.toFixed(2)}`;
        }
        return 'Free';
    };

    const getRewardBadges = () => {
        return pkg.rewards.slice(0, 3).map((reward, idx) => {
            if (reward.type === 'RANK') {
                return (
                    <div key={idx} className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1">
                        <Crown size={12} className="text-amber-400" />
                        <span className="text-xs font-medium text-amber-300">{reward.id.toUpperCase()}</span>
                    </div>
                );
            }
            if (reward.type === 'SEEDS') {
                return (
                    <div key={idx} className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1">
                        <Coins size={12} className="text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-300">{reward.amount.toLocaleString()}</span>
                    </div>
                );
            }
            if (reward.type === 'COSMETIC') {
                return (
                    <div key={idx} className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg px-2 py-1">
                        <Palette size={12} className="text-purple-400" />
                        <span className="text-xs font-medium text-purple-300">Cosmetic</span>
                    </div>
                );
            }
            return null;
        });
    };

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="bg-slate-800/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1"
        >
            {/* Image */}
            <div className="relative h-40 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/60" />
                {pkg.image && (
                    <img
                        src={pkg.image}
                        alt={pkg.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                )}
                {pkg.isSubscription && (
                    <div className="absolute top-3 right-3 bg-blue-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
                        Subscription
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-2 line-clamp-1">
                    {pkg.name}
                </h3>

                <p className="text-sm text-slate-400 mb-4 line-clamp-2 min-h-[2.5rem]">
                    {pkg.description}
                </p>

                {/* Reward Badges */}
                <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
                    {getRewardBadges()}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500 uppercase tracking-wide">Price</span>
                        <span className="text-xl font-bold text-emerald-400">
                            {formatPrice()}
                        </span>
                    </div>

                    <button
                        onClick={() => onPurchase(pkg)}
                        className={`
                            px-6 py-2.5 rounded-xl font-bold transition-all duration-200
                            ${isHovered
                                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-105'
                                : 'bg-emerald-500/80 text-slate-950'
                            }
                            hover:bg-emerald-400 active:scale-95
                        `}
                    >
                        Purchase
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarketView;
