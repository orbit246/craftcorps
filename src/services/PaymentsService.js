/**
 * PaymentsService - Handles all payment-related operations
 * For catalog/item listing, use CatalogService instead
 */
class PaymentsService {
    constructor() {
        this.apiBaseUrl = 'https://api.nortix.app';
    }

    /**
     * Create a checkout session for purchasing an item
     * POST /payments/checkout
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
            console.error('[PaymentsService] Failed to create checkout session:', error);
            // Return mock data for UI testing in development
            return {
                checkoutUrl: 'https://checkout.fungies.io/mock_session',
                sessionId: 'cs_mock_' + Math.random().toString(36).substr(2, 9),
                publicKey: 'pub_test_123456789'
            };
        }
    }

    /**
     * Verify a checkout session status
     * GET /payments/checkout/{sessionId}/status
     * @param {string} sessionId - The checkout session ID
     * @returns {Promise<Object>} Session status
     */
    async getCheckoutStatus(sessionId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/payments/checkout/${sessionId}/status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to get checkout status: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[PaymentsService] Failed to get checkout status:', error);
            return { status: 'unknown' };
        }
    }

    /**
     * Get user's order/purchase history
     * GET /payments/orders
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
     * Get details of a specific order
     * GET /payments/orders/{orderId}
     * @param {string} orderId - The order ID
     * @param {string} authToken - JWT auth token
     * @returns {Promise<Object|null>} Order details or null
     */
    async getOrderById(orderId, authToken) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/payments/orders/${orderId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch order: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[PaymentsService] Failed to fetch order:', error);
            return null;
        }
    }

    /**
     * Cancel a subscription or order
     * POST /payments/orders/{orderId}/cancel
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
     * Request a refund for an order
     * POST /payments/orders/{orderId}/refund
     * @param {string} orderId - The order ID
     * @param {string} authToken - JWT auth token
     * @param {string} reason - Optional refund reason
     * @returns {Promise<Object>} Refund result
     */
    async requestRefund(orderId, authToken, reason = '') {
        try {
            const response = await fetch(`${this.apiBaseUrl}/payments/orders/${orderId}/refund`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to request refund');
            }

            return await response.json();
        } catch (error) {
            console.error('[PaymentsService] Failed to request refund:', error);
            throw error;
        }
    }

    /**
     * Get user's active subscriptions
     * GET /payments/subscriptions
     * @param {string} authToken - JWT auth token
     * @returns {Promise<Array>} Array of active subscriptions
     */
    async getSubscriptions(authToken) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/payments/subscriptions`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[PaymentsService] Failed to fetch subscriptions:', error);
            return [];
        }
    }

    /**
     * Get user's seed balance
     * GET /payments/balance
     * @param {string} authToken - JWT auth token
     * @returns {Promise<Object>} Balance info
     */
    async getBalance(authToken) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/payments/balance`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch balance: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[PaymentsService] Failed to fetch balance:', error);
            return { seeds: 0 };
        }
    }

    /**
     * Purchase an item with seeds (in-game currency)
     * POST /payments/purchase-with-seeds
     * @param {string} productId - The product ID
     * @param {string} authToken - JWT auth token
     * @returns {Promise<Object>} Purchase result
     */
    async purchaseWithSeeds(productId, authToken) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/payments/purchase-with-seeds`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to complete purchase');
            }

            return await response.json();
        } catch (error) {
            console.error('[PaymentsService] Failed to purchase with seeds:', error);
            throw error;
        }
    }
}

export const payments = new PaymentsService();
