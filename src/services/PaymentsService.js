class PaymentsService {
    constructor() {
        this.memoryCache = null; // Cache for packages
        this.apiBaseUrl = 'https://api.nortix.app'; // Update with your actual API URL
    }

    /**
     * Get public packages (no authentication required)
     * @returns {Promise<Array>} Array of public packages
     */
    async getPublicPackages() {
        // Return memory cache if available for instant tab switching
        if (this.memoryCache) {
            return this.memoryCache;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/payments/packages/public`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch packages: ${response.statusText}`);
            }

            const packages = await response.json();

            // Cache the response
            this.memoryCache = packages;

            return packages;
        } catch (error) {
            console.error('[PaymentsService] Failed to fetch public packages:', error);
            // Return mock data on error
            return this.getMockPackages();
        }
    }

    /**
     * Get authenticated packages with eligibility (requires auth token)
     * @param {string} authToken - JWT auth token
     * @returns {Promise<Array>} Array of packages with eligibility info
     */
    async getPackages(authToken) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/payments/packages`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch packages: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[PaymentsService] Failed to fetch authenticated packages:', error);
            return this.getMockPackages();
        }
    }

    /**
     * Create a checkout session
     * @param {string} productId - The package/product ID
     * @param {string} authToken - JWT auth token
     * @returns {Promise<Object>} Checkout session details
     */
    async createCheckoutSession(productId, authToken) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/payments/checkout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create checkout session');
            }

            return await response.json();
        } catch (error) {
            console.error('[PaymentsService] Failed to create checkout session (using mock):', error);
            // Return mock data for UI testing
            return {
                checkoutUrl: 'https://checkout.fungies.io/mock_session',
                sessionId: 'cs_mock_' + Math.random().toString(36).substr(2, 9),
                publicKey: 'pub_test_123456789'
            };
        }
    }

    /**
     * Get user's order history
     * @param {string} authToken - JWT auth token
     * @returns {Promise<Array>} Array of orders
     */
    async getOrders(authToken) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/payments/orders`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch orders: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[PaymentsService] Failed to fetch orders:', error);
            return [];
        }
    }

    /**
     * Cancel a subscription
     * @param {string} orderId - The order/purchase ID
     * @param {string} authToken - JWT auth token
     * @returns {Promise<Object>} Cancellation result
     */
    async cancelOrder(orderId, authToken) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/payments/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to cancel order');
            }

            return await response.json();
        } catch (error) {
            console.error('[PaymentsService] Failed to cancel order:', error);
            throw error;
        }
    }

    /**
     * Get mock packages for development/fallback
     * @returns {Array} Mock package data
     */
    getMockPackages() {
        return [
            {
                id: 'pkg_vip',
                name: 'VIP Rank',
                description: 'Unlock VIP perks and exclusive features',
                image: 'https://images.unsplash.com/photo-1579547621113-e4bb2a19bdd6?w=400&h=300&fit=crop',
                price: 4.99,
                currency: 'USD',
                priceSeeds: null,
                rewards: [
                    { type: 'RANK', id: 'vip' }
                ],
                isActive: true,
                sortOrder: 0,
                publisher: 'OFFICIAL',
                isSubscription: false,
                rankLevel: 1,
                isRepeatable: false,
                category: 'ranks'
            },
            {
                id: 'pkg_vip_plus',
                name: 'VIP+ Rank',
                description: 'Premium VIP tier with enhanced benefits',
                image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&h=300&fit=crop',
                price: 9.99,
                currency: 'USD',
                priceSeeds: null,
                rewards: [
                    { type: 'RANK', id: 'vip_plus' }
                ],
                isActive: true,
                sortOrder: 1,
                publisher: 'OFFICIAL',
                isSubscription: false,
                rankLevel: 2,
                isRepeatable: false,
                category: 'ranks'
            },
            {
                id: 'pkg_mvp',
                name: 'MVP Rank',
                description: 'The ultimate premium experience',
                image: 'https://images.unsplash.com/photo-1620207410770-d3c6e10d2670?w=400&h=300&fit=crop',
                price: 19.99,
                currency: 'USD',
                priceSeeds: null,
                rewards: [
                    { type: 'RANK', id: 'mvp' }
                ],
                isActive: true,
                sortOrder: 2,
                publisher: 'OFFICIAL',
                isSubscription: false,
                rankLevel: 3,
                isRepeatable: false,
                category: 'ranks'
            },
            {
                id: 'pkg_seeds_500',
                name: '500 Seeds',
                description: 'Small seed bundle for quick purchases',
                image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=300&fit=crop',
                price: 2.99,
                currency: 'USD',
                priceSeeds: null,
                rewards: [
                    { type: 'SEEDS', amount: 500 }
                ],
                isActive: true,
                sortOrder: 10,
                publisher: 'OFFICIAL',
                isSubscription: false,
                rankLevel: null,
                isRepeatable: true,
                category: 'currency'
            },
            {
                id: 'pkg_seeds_1000',
                name: '1,000 Seeds',
                description: 'Popular seed bundle',
                image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=300&fit=crop',
                price: 4.99,
                currency: 'USD',
                priceSeeds: null,
                rewards: [
                    { type: 'SEEDS', amount: 1000 }
                ],
                isActive: true,
                sortOrder: 11,
                publisher: 'OFFICIAL',
                isSubscription: false,
                rankLevel: null,
                isRepeatable: true,
                category: 'currency'
            },
            {
                id: 'pkg_seeds_5000',
                name: '5,000 Seeds',
                description: 'Best value seed bundle! +20% bonus',
                image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=300&fit=crop',
                price: 19.99,
                currency: 'USD',
                priceSeeds: null,
                rewards: [
                    { type: 'SEEDS', amount: 6000 }
                ],
                isActive: true,
                sortOrder: 12,
                publisher: 'OFFICIAL',
                isSubscription: false,
                rankLevel: null,
                isRepeatable: true,
                category: 'currency'
            },
            {
                id: 'pkg_cape_dragon',
                name: 'Dragon Cape',
                description: 'Legendary dragon-themed cape cosmetic',
                image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=400&h=300&fit=crop',
                price: 7.99,
                currency: 'USD',
                priceSeeds: null,
                rewards: [
                    { type: 'COSMETIC', id: 'cape_dragon' }
                ],
                isActive: true,
                sortOrder: 20,
                publisher: 'OFFICIAL',
                isSubscription: false,
                rankLevel: null,
                isRepeatable: false,
                category: 'cosmetics'
            },
            {
                id: 'pkg_glyph_fire',
                name: 'Fire Glyph',
                description: 'Blazing fire effect for your character',
                image: 'https://images.unsplash.com/photo-1525183928016-c8bc36cda95e?w=400&h=300&fit=crop',
                price: null,
                currency: 'USD',
                priceSeeds: 250,
                rewards: [
                    { type: 'COSMETIC', id: 'glyph_fire' }
                ],
                isActive: true,
                sortOrder: 21,
                publisher: 'OFFICIAL',
                isSubscription: false,
                rankLevel: null,
                isRepeatable: false,
                category: 'cosmetics'
            },
            {
                id: 'pkg_starter_bundle',
                name: 'Starter Bundle',
                description: 'Everything you need to get started! Includes VIP, 1000 seeds, and a cape',
                image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=300&fit=crop',
                price: 14.99,
                currency: 'USD',
                priceSeeds: null,
                rewards: [
                    { type: 'RANK', id: 'vip' },
                    { type: 'SEEDS', amount: 1000 },
                    { type: 'COSMETIC', id: 'cape_starter' }
                ],
                isActive: true,
                sortOrder: 30,
                publisher: 'OFFICIAL',
                isSubscription: false,
                rankLevel: null,
                isRepeatable: false,
                category: 'bundles'
            }
        ];
    }

    /**
     * Clear the memory cache
     */
    clearCache() {
        this.memoryCache = null;
    }
}

export const payments = new PaymentsService();
