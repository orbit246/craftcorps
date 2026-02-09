import React, { useState, useEffect } from 'react';
import { ShoppingBag, Sparkles, Crown, Gem, Palette, Package, Search, X, Tag } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { catalog } from '../services/CatalogService';
import { payments } from '../services/PaymentsService';
import PaymentModal from '../components/modals/PaymentModal';

// Icon mapping for dynamic category icons from backend
const ICON_MAP = {
    Package: Package,
    Crown: Crown,
    Coins: Gem,
    Palette: Palette,
    Sparkles: Sparkles,
    ShoppingBag: ShoppingBag,
    Tag: Tag
};

const MarketView = () => {
    const { addToast } = useToast();
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Purchase State
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [checkoutData, setCheckoutData] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        loadMarketData();
    }, []);

    const loadMarketData = async () => {
        setIsLoading(true);
        try {
            // Fetch categories and items in parallel using CatalogService
            const [categoriesData, itemsData] = await Promise.all([
                catalog.getCategories(),
                catalog.getAllItems()
            ]);

            setCategories(categoriesData);
            setItems(itemsData);
        } catch (error) {
            console.error('Failed to load market data:', error);
            addToast('Failed to load market items', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to get icon component from string
    const getIconComponent = (iconName) => {
        return ICON_MAP[iconName] || Package;
    };

    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handlePurchase = async (item) => {
        if (isPurchasing) return;

        setIsPurchasing(true);
        setSelectedItem(item);
        addToast(`Starting checkout for ${item.name}...`, 'info');

        try {
            // Retrieve auth token if available
            // TODO: Get from useAccounts/useAuth context
            const authToken = 'placeholder_token';

            const session = await payments.createCheckoutSession(item.id, authToken);

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
        setSelectedItem(null);
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={handleClosePayment}
                sessionId={checkoutData?.sessionId}
                publicKey={checkoutData?.publicKey}
                productName={selectedItem?.name}
                price={selectedItem?.price}
            />

            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-white/5">
                <div className="px-6 py-4">
                    {/* Title Row with Search */}
                    <div className="flex items-center justify-between gap-6 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center ring-1 ring-emerald-500/30">
                                <ShoppingBag size={20} className="text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-300 tracking-tight">
                                    Market
                                </h1>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-sm">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search items..."
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 pl-10 pr-8 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-800/80 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {categories.map((category) => {
                            const Icon = getIconComponent(category.icon);
                            const isActive = selectedCategory === category.id;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`
                                        flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap text-sm
                                        ${isActive
                                            ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50'
                                        }
                                    `}
                                >
                                    <Icon size={14} />
                                    <span>{category.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-slate-800/30 rounded-2xl h-80 animate-pulse" />
                        ))}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                        <Package size={64} className="text-slate-700 mb-4" />
                        <h3 className="text-xl font-bold text-slate-400 mb-2">No items found</h3>
                        <p className="text-slate-600">Try adjusting your filters or search query</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                        {filteredItems.map((item) => (
                            <ItemCard
                                key={item.id}
                                item={item}
                                onPurchase={handlePurchase}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ItemCard = ({ item, onPurchase }) => {
    const [isHovered, setIsHovered] = useState(false);

    const formatPrice = () => {
        if (item.priceSeeds) {
            return `${item.priceSeeds} Shards`;
        }
        if (item.price) {
            return `$${item.price.toFixed(2)}`;
        }
        return 'Free';
    };

    const getRewardBadges = () => {
        if (!item.rewards) return null;
        return item.rewards.slice(0, 3).map((reward, idx) => {
            if (reward.type === 'RANK') {
                return (
                    <div key={idx} className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1">
                        <Crown size={12} className="text-amber-400" />
                        <span className="text-xs font-medium text-amber-300">{reward.id.toUpperCase()}</span>
                    </div>
                );
            }
            if (reward.type === 'SEEDS' || reward.type === 'SHARDS') {
                return (
                    <div key={idx} className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1">
                        <Gem size={12} className="text-emerald-400" />
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
                {item.image && (
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                )}
                {item.isSubscription && (
                    <div className="absolute top-3 right-3 bg-blue-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
                        Subscription
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-2 line-clamp-1">
                    {item.name}
                </h3>

                <p className="text-sm text-slate-400 mb-4 line-clamp-2 min-h-[2.5rem]">
                    {item.description}
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
                        onClick={() => onPurchase(item)}
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
