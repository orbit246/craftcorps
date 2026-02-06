/**
 * CatalogService - Handles all catalog/market item listing operations
 * Separated from PaymentsService for better maintainability
 */
class CatalogService {
    constructor() {
        this.categoriesCache = null;
        this.itemsCache = null;
        this.featuredCache = null;
        this.apiBaseUrl = 'https://api.nortix.app';
    }

    /**
     * Get catalog categories with item counts
     * GET /catalog/categories
     * @returns {Promise<Array>} Array of categories
     */
    async getCategories() {
        if (this.categoriesCache) {
            return this.categoriesCache;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/catalog/categories`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch categories: ${response.statusText}`);
            }

            const categories = await response.json();
            this.categoriesCache = categories;
            return categories;
        } catch (error) {
            console.error('[CatalogService] Failed to fetch categories:', error);
            return this.getDefaultCategories();
        }
    }

    /**
     * Get all catalog items with optional filtering and pagination
     * GET /catalog?category=...&page=...&limit=...&search=...
     * @param {Object} options - Query options
     * @param {string} options.category - Filter by category
     * @param {number} options.page - Page number for pagination
     * @param {number} options.limit - Items per page
     * @param {string} options.search - Search query
     * @returns {Promise<Object>} Catalog items with pagination info
     */
    async getItems(options = {}) {
        const { category, page, limit, search } = options;
        const params = new URLSearchParams();

        if (category && category !== 'all') params.append('category', category);
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (search) params.append('search', search);

        const queryString = params.toString();
        const url = `${this.apiBaseUrl}/catalog${queryString ? `?${queryString}` : ''}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch catalog items: ${response.statusText}`);
            }

            const data = await response.json();

            // Handle both array response and paginated response
            if (Array.isArray(data)) {
                return { items: data, total: data.length };
            }
            return data;
        } catch (error) {
            console.error('[CatalogService] Failed to fetch catalog items:', error);
            const mockItems = this.getMockItems();
            return { items: mockItems, total: mockItems.length };
        }
    }

    /**
     * Get all items (simplified version for backwards compatibility)
     * @returns {Promise<Array>} Array of items
     */
    async getAllItems() {
        if (this.itemsCache) {
            return this.itemsCache;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/catalog`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch items: ${response.statusText}`);
            }

            const data = await response.json();
            const items = Array.isArray(data) ? data : (data.items || []);
            this.itemsCache = items;
            return items;
        } catch (error) {
            console.error('[CatalogService] Failed to fetch all items:', error);
            return this.getMockItems();
        }
    }

    /**
     * Get featured items for homepage
     * GET /catalog/featured
     * @returns {Promise<Array>} Array of featured items
     */
    async getFeaturedItems() {
        if (this.featuredCache) {
            return this.featuredCache;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/catalog/featured`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch featured items: ${response.statusText}`);
            }

            const items = await response.json();
            this.featuredCache = items;
            return items;
        } catch (error) {
            console.error('[CatalogService] Failed to fetch featured items:', error);
            return this.getMockItems().slice(0, 3);
        }
    }

    /**
     * Get single item details by ID
     * GET /catalog/item/{id}
     * @param {string} itemId - The item ID
     * @returns {Promise<Object|null>} Item details or null
     */
    async getItemById(itemId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/catalog/item/${itemId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch item details: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[CatalogService] Failed to fetch item details:', error);
            return null;
        }
    }

    /**
     * Get packages only (ranks, currency, bundles - purchasable items)
     * GET /catalog/packages
     * @returns {Promise<Array>} Array of packages
     */
    async getPackages() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/catalog/packages`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch packages: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[CatalogService] Failed to fetch packages:', error);
            return this.getMockItems().filter(p => p.category !== 'cosmetics');
        }
    }

    /**
     * Get cosmetics only
     * GET /catalog/cosmetics
     * @returns {Promise<Array>} Array of cosmetics
     */
    async getCosmetics() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/catalog/cosmetics`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch cosmetics: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[CatalogService] Failed to fetch cosmetics:', error);
            return this.getMockItems().filter(p => p.category === 'cosmetics');
        }
    }

    /**
     * Get default categories for fallback
     * @returns {Array} Default category data
     */
    getDefaultCategories() {
        return [
            { id: 'all', name: 'All Items', icon: 'Package' },
            { id: 'ranks', name: 'Ranks', icon: 'Crown' },
            { id: 'currency', name: 'Currency', icon: 'Coins' },
            { id: 'cosmetics', name: 'Cosmetics', icon: 'Palette' },
            { id: 'bundles', name: 'Bundles', icon: 'Sparkles' }
        ];
    }

    /**
     * Get mock items for development/fallback
     * @returns {Array} Mock item data
     */
    getMockItems() {
        return [
            {
                id: 'pkg_vip',
                name: 'VIP Rank',
                description: 'Unlock VIP perks and exclusive features',
                image: 'https://images.unsplash.com/photo-1579547621113-e4bb2a19bdd6?w=400&h=300&fit=crop',
                price: 4.99,
                currency: 'USD',
                priceSeeds: null,
                rewards: [{ type: 'RANK', id: 'vip' }],
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
                rewards: [{ type: 'RANK', id: 'vip_plus' }],
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
                rewards: [{ type: 'RANK', id: 'mvp' }],
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
                rewards: [{ type: 'SEEDS', amount: 500 }],
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
                rewards: [{ type: 'SEEDS', amount: 1000 }],
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
                rewards: [{ type: 'SEEDS', amount: 6000 }],
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
                rewards: [{ type: 'COSMETIC', id: 'cape_dragon' }],
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
                rewards: [{ type: 'COSMETIC', id: 'glyph_fire' }],
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
     * Clear all caches
     */
    clearCache() {
        this.categoriesCache = null;
        this.itemsCache = null;
        this.featuredCache = null;
    }
}

export const catalog = new CatalogService();
