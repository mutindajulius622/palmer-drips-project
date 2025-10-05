// Palmer Drips - Complete E-commerce Application
class PalmerDripsApp {
    constructor() {
        this.products = [];
        this.cart = [];
        this.wishlist = [];
        this.selectedSizes = {};
        this.orders = [];
        this.apiBase = 'data/db.json';
        
        this.deliveryPrices = {
            'nairobi-cbd': 200,
            'westlands': 300,
            'karen': 500,
            'langata': 400,
            'ruaka': 450,
            'thika': 600,
            'juja': 650,
            'kiambu': 550,
            'outside-nairobi': 0
        };
        
        this.paymentTimer = null;
        
        this.init();
    }

    async init() {
        try {
            await this.loadProducts();
        } catch (error) {
            console.error('Failed to load products, using sample data:', error);
            this.loadSampleProducts();
        }

        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.renderAllProducts();
        this.setupCheckoutForm();
        
        console.log('Palmer Drips app initialized successfully');
    }

    // === PRODUCTS MANAGEMENT ===
    async loadProducts() {
        try {
            console.log('Loading products from:', this.apiBase);
            const response = await fetch(this.apiBase);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.products && Array.isArray(data.products)) {
                this.products = data.products;
            } else if (Array.isArray(data)) {
                this.products = data;
            } else {
                throw new Error('Invalid JSON structure');
            }
            
            console.log('Successfully loaded products:', this.products.length);
            
        } catch (error) {
            console.error('Error loading products:', error);
            throw error;
        }
    }

    loadSampleProducts() {
        this.products = [
            {
                id: 1,
                name: "Air Force One White",
                brand: "Nike",
                price: 2500,
                category: "sneakers",
                images: ["images/air-force-white.jpg"],
                sizes: ["EUR 40", "EUR 41", "EUR 42", "EUR 43", "EUR 44", "EUR 45"],
                colors: ["White"],
                featured: true,
                description: "Classic white sneakers"
            },
            {
                id: 2,
                name: "SB Dunk Red",
                brand: "Nike",
                price: 3799,
                category: "sneakers",
                images: ["images/red-sb-dunks.jpg"],
                sizes: ["EUR 40", "EUR 41", "EUR 42", "EUR 43", "EUR 44", "EUR 45"],
                colors: ["Red"],
                featured: true,
                description: "Red SB Dunk sneakers"
            },
            {
                id: 3,
                name: "Cactus Jack Tee",
                brand: "Cactus Jack",
                price: 1700,
                category: "clothing",
                images: ["images/cactus-jack-tee.jpeg"],
                sizes: ["M", "L", "XL"],
                colors: ["Cream"],
                featured: true,
                description: "Premium cotton t-shirt"
            },
            {
                id: 4,
                name: "Jordan 3 Retro",
                brand: "Jordan",
                price: 4199,
                category: "sneakers",
                images: ["images/J3-Retro.jpg"],
                sizes: ["EUR 40", "EUR 41", "EUR 42", "EUR 43", "EUR 44"],
                colors: ["Grey", "White"],
                featured: true,
                description: "Classic Jordan 3 Retro"
            }
        ];
        console.log('Using sample products:', this.products);
    }

    getFeaturedProducts() {
        return this.products.filter(p => p.featured).slice(0, 4);
    }

    getProductsByCategory(category) {
        return this.products.filter(p => p.category === category);
    }

    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    // === RENDERING ===
    createProductCard(product) {
        const mainImage = product.images && product.images.length > 0 
            ? product.images[0] 
            : 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80';
        
        const sizeButtons = product.sizes && product.sizes.length > 0 
            ? this.generateSizeButtons(product.sizes, product.id) 
            : '<p class="no-sizes">No sizes available</p>';
        
        return `
            <div class="product-card" data-id="${product.id}">
                ${product.featured ? '<span class="product-badge">Featured</span>' : ''}
                
                <div class="product-image">
                    <img src="${mainImage}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80'">
                    <div class="product-actions">
                        <button class="product-action-btn wishlist-btn" data-id="${product.id}" type="button">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
                
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-brand">${product.brand}</p>
                    
                    <div class="size-selection">
                        <label class="size-label">Size:</label>
                        <div class="size-buttons" id="sizes-${product.id}">
                            ${sizeButtons}
                        </div>
                    </div>
                    
                    <div class="product-price">
                        Ksh ${product.price.toLocaleString()}
                    </div>
                    <button class="add-to-cart" data-id="${product.id}" type="button">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    }

    generateSizeButtons(sizes, productId) {
        return sizes.map(size => `
            <button class="size-btn" type="button"
                    data-product="${productId}" 
                    data-size="${size}">
                ${size}
            </button>
        `).join('');
    }

    renderProducts(containerId, products) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        console.log(`Rendering ${products.length} products in ${containerId}`);
        
        if (products.length === 0) {
            container.innerHTML = '<div class="loading">No products found</div>';
            return;
        }
        
        container.innerHTML = products.map(product => this.createProductCard(product)).join('');
    }

    renderFeaturedProducts() {
        const featuredProducts = this.getFeaturedProducts();
        this.renderProducts('featured-products', featuredProducts);
    }

    renderSneakers() {
        const sneakers = this.getProductsByCategory('sneakers');
        this.renderProducts('sneakers-products', sneakers);
    }

    renderClothing() {
        const clothing = this.getProductsByCategory('clothing');
        this.renderProducts('clothing-products', clothing);
    }

    renderAllProducts() {
        this.renderFeaturedProducts();
        this.renderSneakers();
        this.renderClothing();
    }

    // === CART MANAGEMENT ===
    addToCart(productId) {
        const product = this.getProductById(productId);
        if (!product) {
            this.showNotification('Product not found', 'error');
            return;
        }
        
        const selectedSize = this.selectedSizes[productId];
        
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            this.showNotification('Please select a size before adding to cart', 'error');
            return;
        }
        
        // Check if item already exists in cart (with same size)
        const existingItemIndex = this.cart.findIndex(item => 
            item.id === productId && item.selectedSize === selectedSize
        );
        
        if (existingItemIndex > -1) {
            this.cart[existingItemIndex].quantity++;
        } else {
            this.cart.push({
                ...product,
                quantity: 1,
                selectedSize: selectedSize,
                selectedColor: product.colors ? product.colors[0] : null
            });
        }
        
        this.updateCartCount();
        const sizeText = selectedSize ? ` (Size: ${selectedSize})` : '';
        this.showNotification(`${product.name}${sizeText} added to cart!`, 'success');
    }

    removeFromCart(productId, size) {
        this.cart = this.cart.filter(item => 
            !(item.id === productId && item.selectedSize === size)
        );
        this.updateCartCount();
        this.showNotification('Item removed from cart', 'info');
    }

    updateQuantity(productId, size, change) {
        const itemIndex = this.cart.findIndex(item => 
            item.id === productId && item.selectedSize === size
        );
        
        if (itemIndex === -1) return;
        
        this.cart[itemIndex].quantity += change;
        
        if (this.cart[itemIndex].quantity <= 0) {
            this.removeFromCart(productId, size);
        } else {
            this.updateCartCount();
        }
    }

    getCartTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getCartItemCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    updateCartCount() {
        const totalItems = this.getCartItemCount();
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) cartCount.textContent = totalItems;
        this.renderCartItems();
    }

    renderCartItems() {
        const container = document.getElementById('cart-items');
        if (!container) return;

        const total = this.getCartTotal();
        
        if (this.cart.length === 0) {
            container.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        } else {
            container.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <img src="${item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&q=80'}" 
                         alt="${item.name}" class="cart-item-image" onerror="this.src='https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&q=80'">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <p class="cart-item-brand">${item.brand}</p>
                        ${item.selectedSize ? `<p class="cart-item-size"><strong>Size:</strong> ${item.selectedSize}</p>` : ''}
                        <p class="cart-item-price">Ksh ${item.price.toLocaleString()} × ${item.quantity}</p>
                        <div class="cart-item-actions">
                            <button class="quantity-btn" type="button" onclick="app.updateQuantity(${item.id}, '${item.selectedSize}', -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" type="button" onclick="app.updateQuantity(${item.id}, '${item.selectedSize}', 1)">+</button>
                            <button class="remove-btn" type="button" onclick="app.removeFromCart(${item.id}, '${item.selectedSize}')">Remove</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        const cartTotal = document.getElementById('cart-total-price');
        if (cartTotal) cartTotal.textContent = `Ksh ${total.toLocaleString()}`;
    }

    // === WISHLIST MANAGEMENT ===
    toggleWishlist(productId) {
        const product = this.getProductById(productId);
        if (!product) return;
        
        const index = this.wishlist.findIndex(item => item.id === productId);
        const btn = document.querySelector(`.wishlist-btn[data-id="${productId}"] i`);
        
        if (index > -1) {
            this.wishlist.splice(index, 1);
            if (btn) btn.className = 'far fa-heart';
            this.showNotification(`${product.name} removed from wishlist`, 'info');
        } else {
            this.wishlist.push(product);
            if (btn) btn.className = 'fas fa-heart';
            this.showNotification(`${product.name} added to wishlist!`, 'success');
        }
        
        this.updateWishlistCount();
    }

    updateWishlistCount() {
        const wishlistCount = document.querySelector('.wishlist-count');
        if (wishlistCount) wishlistCount.textContent = this.wishlist.length;
    }

    // === CHECKOUT & PAYMENT ===
    showCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty', 'error');
            return;
        }

        this.updateOrderSummary();
        document.querySelector('.checkout-overlay').classList.add('active');
        document.body.classList.add('modal-open');
    }

    hideCheckout() {
        document.querySelector('.checkout-overlay').classList.remove('active');
        document.body.classList.remove('modal-open');
    }

    updateOrderSummary() {
        const subtotal = this.getCartTotal();
        const deliveryArea = document.getElementById('delivery-area');
        const deliveryCost = deliveryArea ? this.deliveryPrices[deliveryArea.value] || 0 : 0;
        const total = subtotal + deliveryCost;

        // Update summary items
        const summaryItems = document.getElementById('checkout-items');
        if (summaryItems) {
            summaryItems.innerHTML = this.cart.map(item => `
                <div class="summary-item">
                    <span>${item.name} × ${item.quantity}</span>
                    <span>Ksh ${(item.price * item.quantity).toLocaleString()}</span>
                </div>
            `).join('');
        }

        // Update totals
        document.getElementById('summary-subtotal').textContent = `Ksh ${subtotal.toLocaleString()}`;
        document.getElementById('summary-delivery').textContent = `Ksh ${deliveryCost.toLocaleString()}`;
        document.getElementById('summary-total').textContent = `Ksh ${total.toLocaleString()}`;
    }

    setupCheckoutForm() {
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.innerHTML = this.generateCheckoutForm();
            this.setupCheckoutEventListeners();
        }
    }

    generateCheckoutForm() {
        return `
            <div class="form-section">
                <h4>Delivery Information</h4>
                <div class="form-group">
                    <label for="customer-name">Full Name *</label>
                    <input type="text" id="customer-name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="customer-phone">Phone Number *</label>
                    <input type="tel" id="customer-phone" name="phone" required>
                </div>
                <div class="form-group">
                    <label for="customer-email">Email</label>
                    <input type="email" id="customer-email" name="email">
                </div>
            </div>

            <div class="form-section">
                <h4>Delivery Location</h4>
                <div class="form-group">
                    <label for="delivery-area">Select Area *</label>
                    <select id="delivery-area" name="area" required>
                        <option value="">Choose delivery area</option>
                        <option value="nairobi-cbd">Nairobi CBD - Ksh 200</option>
                        <option value="westlands">Westlands - Ksh 300</option>
                        <option value="karen">Karen - Ksh 500</option>
                        <option value="langata">Langata - Ksh 400</option>
                        <option value="ruaka">Ruaka - Ksh 450</option>
                        <option value="thika">Thika - Ksh 600</option>
                        <option value="juja">Juja - Ksh 650</option>
                        <option value="kiambu">Kiambu - Ksh 550</option>
                        <option value="outside-nairobi">Outside Nairobi - Contact for quote</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="delivery-address">Detailed Address *</label>
                    <textarea id="delivery-address" name="address" rows="3" required placeholder="Building name, street, landmarks..."></textarea>
                </div>
                <div class="delivery-notes">
                    <p><i class="fas fa-info-circle"></i> Delivery within 24 hours in Nairobi CBD. 2-3 days for other areas.</p>
                </div>
            </div>

            <div class="form-section">
                <h4>Payment Method</h4>
                <div class="payment-methods">
                    <div class="payment-option">
                        <input type="radio" id="mpesa" name="payment" value="mpesa" checked>
                        <label for="mpesa">
                            <i class="fas fa-mobile-alt"></i>
                            M-Pesa
                        </label>
                    </div>
                    <div class="payment-option">
                        <input type="radio" id="cash-on-delivery" name="payment" value="cash">
                        <label for="cash-on-delivery">
                            <i class="fas fa-money-bill-wave"></i>
                            Cash on Delivery
                        </label>
                    </div>
                    <div class="payment-option">
                        <input type="radio" id="bank-transfer" name="payment" value="bank">
                        <label for="bank-transfer">
                            <i class="fas fa-university"></i>
                            Bank Transfer
                        </label>
                    </div>
                </div>
                
                <div class="mpesa-instructions" id="mpesa-instructions">
                    <h5>M-Pesa Payment Instructions:</h5>
                    <ol>
                        <li>Click "Place Order" to get M-Pesa prompt</li>
                        <li>Enter your M-Pesa PIN when prompted</li>
                        <li>You'll receive confirmation SMS</li>
                    </ol>
                    <div class="mpesa-details">
                        <p><strong>PayBill:</strong> 247247</p>
                        <p><strong>Account:</strong> PALMERDRIPS</p>
                    </div>
                </div>
            </div>

            <div class="order-summary">
                <h4>Order Summary</h4>
                <div class="summary-items" id="checkout-items"></div>
                <div class="summary-totals">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span id="summary-subtotal">Ksh 0</span>
                    </div>
                    <div class="summary-row">
                        <span>Delivery:</span>
                        <span id="summary-delivery">Ksh 0</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span id="summary-total">Ksh 0</span>
                    </div>
                </div>
            </div>

            <div class="checkout-actions">
                <button type="button" class="btn btn-secondary back-to-cart">Back to Cart</button>
                <button type="submit" class="btn btn-primary place-order">Place Order</button>
            </div>
        `;
    }

    setupCheckoutEventListeners() {
        const deliveryArea = document.getElementById('delivery-area');
        const paymentMethods = document.querySelectorAll('input[name="payment"]');
        const checkoutForm = document.getElementById('checkout-form');
        const checkoutClose = document.querySelector('.checkout-close');
        const backToCartBtn = document.querySelector('.back-to-cart');

        if (deliveryArea) {
            deliveryArea.addEventListener('change', () => {
                this.updateOrderSummary();
            });
        }

        if (paymentMethods) {
            paymentMethods.forEach(method => {
                method.addEventListener('change', (e) => {
                    this.handlePaymentMethodChange(e.target.value);
                });
            });
        }

        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                this.handleCheckoutSubmit(e);
            });
        }

        if (checkoutClose) {
            checkoutClose.addEventListener('click', () => {
                this.hideCheckout();
            });
        }

        if (backToCartBtn) {
            backToCartBtn.addEventListener('click', () => {
                this.hideCheckout();
            });
        }
    }

    handlePaymentMethodChange(method) {
        const mpesaInstructions = document.getElementById('mpesa-instructions');
        if (mpesaInstructions) {
            if (method === 'mpesa') {
                mpesaInstructions.classList.add('active');
            } else {
                mpesaInstructions.classList.remove('active');
            }
        }
    }

    async handleCheckoutSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const customerInfo = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            area: formData.get('area'),
            address: formData.get('address'),
            payment: formData.get('payment')
        };

        // Validate form
        if (!customerInfo.name || !customerInfo.phone || !customerInfo.area || !customerInfo.address) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const subtotal = this.getCartTotal();
        const deliveryCost = this.deliveryPrices[customerInfo.area] || 0;
        const total = subtotal + deliveryCost;

        const order = {
            id: Date.now(),
            items: [...this.cart],
            customerInfo: customerInfo,
            subtotal: subtotal,
            delivery: deliveryCost,
            total: total,
            timestamp: new Date().toISOString(),
            status: 'pending',
            paymentMethod: customerInfo.payment
        };

        if (customerInfo.payment === 'mpesa') {
            await this.processMpesaPayment(order);
        } else {
            await this.processOrder(order);
        }
    }

    async processMpesaPayment(order) {
        this.hideCheckout();
        this.showPaymentProcessing();

        try {
            // Simulate M-Pesa payment processing
            setTimeout(() => {
                this.hidePaymentProcessing();
                this.processOrder(order);
            }, 5000);

        } catch (error) {
            this.hidePaymentProcessing();
            this.showNotification('Payment processing failed. Please try again.', 'error');
        }
    }

    showPaymentProcessing() {
        // Create payment processing modal
        const paymentHTML = `
            <div class="payment-overlay active">
                <div class="payment-modal">
                    <div class="payment-header">
                        <h3>Processing Payment</h3>
                    </div>
                    <div class="payment-content">
                        <div class="payment-loader">
                            <div class="loader"></div>
                            <p>Waiting for M-Pesa confirmation...</p>
                        </div>
                        <div class="payment-instructions">
                            <p>Please check your phone and enter your M-Pesa PIN</p>
                            <div class="payment-timeout">
                                <i class="fas fa-clock"></i>
                                <span>This will timeout in: <strong id="payment-timer">120</strong>s</span>
                            </div>
                        </div>
                    </div>
                    <div class="payment-actions">
                        <button class="btn btn-secondary cancel-payment" type="button">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', paymentHTML);
        document.body.classList.add('modal-open');
        
        // Add cancel button event listener
        document.querySelector('.cancel-payment').addEventListener('click', () => {
            this.hidePaymentProcessing();
        });
        
        // Start countdown timer
        let timeLeft = 120;
        const timerElement = document.getElementById('payment-timer');
        const timer = setInterval(() => {
            timeLeft--;
            if (timerElement) timerElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.hidePaymentProcessing();
                this.showNotification('Payment timeout. Please try again.', 'error');
            }
        }, 1000);
        
        this.paymentTimer = timer;
    }

    hidePaymentProcessing() {
        const paymentOverlay = document.querySelector('.payment-overlay');
        if (paymentOverlay) {
            paymentOverlay.remove();
        }
        if (this.paymentTimer) {
            clearInterval(this.paymentTimer);
        }
        document.body.classList.remove('modal-open');
    }

    async processOrder(order) {
        try {
            this.saveOrder(order);
            this.notifyOwner(order);
            
            // Clear cart first
            this.clearCart();
            
            // Close checkout modal
            this.hideCheckout();
            
            // Show confirmation
            this.showOrderConfirmation(order);
            
        } catch (error) {
            console.error('Order processing error:', error);
            this.showNotification('Failed to process order. Please try again.', 'error');
        }
    }

    // === ORDER MANAGEMENT ===
    saveOrder(order) {
        this.orders.push(order);
        localStorage.setItem('palmerDrips_orders', JSON.stringify(this.orders));
    }

    loadOrders() {
        const savedOrders = localStorage.getItem('palmerDrips_orders');
        if (savedOrders) {
            this.orders = JSON.parse(savedOrders);
        }
    }

    notifyOwner(order) {
        const orderSummary = `
NEW ORDER #${order.id}
Customer: ${order.customerInfo.name}
Phone: ${order.customerInfo.phone}
Location: ${order.customerInfo.area} - ${order.customerInfo.address}
Total: Ksh ${order.total.toLocaleString()}
Items: ${order.items.length}
Time: ${new Date(order.timestamp).toLocaleString()}
        `;
        
        console.log('Owner notification:', orderSummary);
        
        // Send WhatsApp notification
        const phone = '+254757809378';
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(orderSummary)}`;
        window.open(whatsappUrl, '_blank');
    }

    showOrderConfirmation(order) {
        const confirmationHTML = `
            <div class="confirmation-overlay active">
                <div class="confirmation-modal">
                    <div class="confirmation-header">
                        <i class="fas fa-check-circle"></i>
                        <h3>Order Confirmed!</h3>
                    </div>
                    <div class="confirmation-content">
                        <p>Thank you for your order!</p>
                        <div class="order-details">
                            <p><strong>Order ID:</strong> <span>#${order.id}</span></p>
                            <p><strong>Total Amount:</strong> <span>Ksh ${order.total.toLocaleString()}</span></p>
                            <p><strong>Delivery to:</strong> <span>${order.customerInfo.area}, ${order.customerInfo.address}</span></p>
                        </div>
                        <div class="confirmation-message">
                            <p>We'll contact you shortly to confirm delivery details.</p>
                            <p>For any questions, call: <strong>+254 757 809 378</strong></p>
                        </div>
                    </div>
                    <div class="confirmation-actions">
                        <button class="btn btn-primary continue-shopping" type="button">Continue Shopping</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', confirmationHTML);
        document.body.classList.add('modal-open');
        
        // Add continue shopping event listener
        document.querySelector('.continue-shopping').addEventListener('click', () => {
            this.hideConfirmation();
            this.scrollToSection('#home');
        });
    }

    hideConfirmation() {
        const confirmationOverlay = document.querySelector('.confirmation-overlay');
        if (confirmationOverlay) {
            confirmationOverlay.remove();
        }
        document.body.classList.remove('modal-open');
    }

    // === ADMIN FUNCTIONALITY ===
    showAdminPanel() {
        const password = prompt('Enter admin password:');
        if (password === 'admin123') {
            this.renderAdminPanel();
        } else {
            this.showNotification('Invalid password', 'error');
        }
    }

    renderAdminPanel() {
        this.loadOrders();
        
        const adminHTML = `
            <div class="admin-panel">
                <h2>Palmer Drips - Order Management</h2>
                <div class="orders-stats">
                    <div class="stat-card">
                        <h3>Total Orders</h3>
                        <p>${this.orders.length}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Pending</h3>
                        <p>${this.orders.filter(o => o.status === 'pending').length}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Completed</h3>
                        <p>${this.orders.filter(o => o.status === 'completed').length}</p>
                    </div>
                </div>
                <div class="orders-list">
                    ${this.orders.length === 0 ? 
                        '<p class="loading">No orders yet</p>' : 
                        this.orders.map(order => this.createOrderCard(order)).join('')
                    }
                </div>
            </div>
        `;
        
        document.body.innerHTML = adminHTML;
    }

    createOrderCard(order) {
        return `
            <div class="order-card">
                <h3>Order #${order.id}</h3>
                <p><strong>Status:</strong> <span class="status-${order.status}">${order.status}</span></p>
                <p><strong>Total:</strong> Ksh ${order.total.toLocaleString()}</p>
                <p><strong>Date:</strong> ${new Date(order.timestamp).toLocaleString()}</p>
                <p><strong>Customer:</strong> ${order.customerInfo.name}</p>
                <p><strong>Phone:</strong> ${order.customerInfo.phone}</p>
                <p><strong>Email:</strong> ${order.customerInfo.email || 'Not provided'}</p>
                <p><strong>Location:</strong> ${order.customerInfo.area} - ${order.customerInfo.address}</p>
                <p><strong>Payment:</strong> ${order.paymentMethod}</p>
                <div class="order-items">
                    <h4>Items:</h4>
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.name} - ${item.brand}</span>
                            <span>Ksh ${item.price} × ${item.quantity}</span>
                            ${item.selectedSize ? ` (Size: ${item.selectedSize})` : ''}
                        </div>
                    `).join('')}
                </div>
                <div class="order-actions">
                    <button class="btn btn-primary" type="button" onclick="app.updateOrderStatus(${order.id}, 'completed')">
                        Mark Completed
                    </button>
                    <button class="btn btn-secondary" type="button" onclick="app.contactCustomer('${order.customerInfo.phone}')">
                        Contact Customer
                    </button>
                </div>
            </div>
        `;
    }

    updateOrderStatus(orderId, status) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            localStorage.setItem('palmerDrips_orders', JSON.stringify(this.orders));
            this.renderAdminPanel();
            this.showNotification(`Order #${orderId} marked as ${status}`, 'success');
        }
    }

    contactCustomer(phone) {
        const whatsappUrl = `https://wa.me/${phone}`;
        window.open(whatsappUrl, '_blank');
    }

    // === UTILITY METHODS ===
    setupEventListeners() {
        // Event delegation for all dynamic elements
        document.addEventListener('click', (e) => {
            // Cart button
            if (e.target.classList.contains('cart-btn') || e.target.closest('.cart-btn')) {
                e.preventDefault();
                this.toggleCart();
                return;
            }
            
            // Cart close button
            if (e.target.classList.contains('cart-close') || e.target.closest('.cart-close')) {
                e.preventDefault();
                this.toggleCart();
                return;
            }
            
            // Checkout button in cart
            if (e.target.classList.contains('checkout-btn') || e.target.closest('.checkout-btn')) {
                e.preventDefault();
                this.showCheckout();
                return;
            }
            
            // Add to cart buttons
            if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
                e.preventDefault();
                const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
                const productId = parseInt(button.dataset.id);
                this.addToCart(productId);
                return;
            }
            
            // Wishlist buttons
            if (e.target.classList.contains('wishlist-btn') || e.target.closest('.wishlist-btn')) {
                e.preventDefault();
                const button = e.target.classList.contains('wishlist-btn') ? e.target : e.target.closest('.wishlist-btn');
                const productId = parseInt(button.dataset.id);
                this.toggleWishlist(productId);
                return;
            }
            
            // Size buttons
            if (e.target.classList.contains('size-btn') || e.target.closest('.size-btn')) {
                e.preventDefault();
                const button = e.target.classList.contains('size-btn') ? e.target : e.target.closest('.size-btn');
                const productId = parseInt(button.dataset.product);
                const size = button.dataset.size;
                this.selectSize(productId, size);
                return;
            }
            
            // Navigation links
            if (e.target.classList.contains('nav-link') || e.target.closest('.nav-link')) {
                e.preventDefault();
                const link = e.target.classList.contains('nav-link') ? e.target : e.target.closest('.nav-link');
                const section = link.getAttribute('href') || link.dataset.section;
                this.handleNavigation(section);
                return;
            }
            
            // Footer links
            if (e.target.classList.contains('footer-link') || e.target.closest('.footer-link')) {
                e.preventDefault();
                const link = e.target.classList.contains('footer-link') ? e.target : e.target.closest('.footer-link');
                const section = link.getAttribute('href');
                this.handleNavigation(section);
                return;
            }
            
            // Hero buttons
            if (e.target.classList.contains('btn') && e.target.closest('.hero-buttons')) {
                e.preventDefault();
                const target = e.target.dataset.target;
                this.scrollToSection(`#${target}`);
                return;
            }
            
            // Category cards
            if (e.target.classList.contains('category-card') || e.target.closest('.category-card')) {
                e.preventDefault();
                const card = e.target.classList.contains('category-card') ? e.target : e.target.closest('.category-card');
                const category = card.dataset.category;
                this.filterByCategory(category);
                return;
            }
            
            // Admin access button
            if (e.target.classList.contains('admin-access-btn') || e.target.closest('.admin-access-btn')) {
                e.preventDefault();
                this.showAdminPanel();
                return;
            }
            
            // Search button
            if (e.target.classList.contains('search-btn') || e.target.closest('.search-btn')) {
                e.preventDefault();
                this.toggleSearch();
                return;
            }
            
            // Search close button
            if (e.target.classList.contains('search-close') || e.target.closest('.search-close')) {
                e.preventDefault();
                this.toggleSearch();
                return;
            }
        });

        // Mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }

        // Newsletter form
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletter(e);
            });
        }

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-overlay')) {
                this.toggleCart();
            }
            if (e.target.classList.contains('search-overlay')) {
                this.toggleSearch();
            }
        });
    }

    selectSize(productId, size) {
        const sizeButtons = document.querySelectorAll(`.size-btn[data-product="${productId}"]`);
        sizeButtons.forEach(btn => btn.classList.remove('active'));
        
        const selectedButton = document.querySelector(`.size-btn[data-product="${productId}"][data-size="${size}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }
        
        this.selectedSizes[productId] = size;
    }

    toggleCart() {
        const cartOverlay = document.querySelector('.cart-overlay');
        if (cartOverlay) {
            cartOverlay.classList.toggle('active');
            
            // Prevent body scroll when cart is open
            if (cartOverlay.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }

    toggleSearch() {
        const searchOverlay = document.querySelector('.search-overlay');
        if (searchOverlay) {
            searchOverlay.classList.toggle('active');
            
            // Focus on search input when opened
            if (searchOverlay.classList.contains('active')) {
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                    searchInput.focus();
                }
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }

    toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.classList.toggle('active');
        }
    }

    handleNavigation(section) {
        // Close mobile menu if open
        this.toggleMobileMenu();
        
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to clicked link
        const activeLink = document.querySelector(`[href="${section}"], [data-section="${section.replace('#', '')}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Scroll to section
        this.scrollToSection(section);
    }

    scrollToSection(section) {
        // Close any open overlays first
        this.hideCheckout();
        this.hideConfirmation();
        this.toggleSearch();
        
        const cartOverlay = document.querySelector('.cart-overlay');
        if (cartOverlay && cartOverlay.classList.contains('active')) {
            this.toggleCart();
        }
        
        const targetElement = document.querySelector(section);
        if (targetElement) {
            // Scroll to section
            targetElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    filterByCategory(category) {
        this.scrollToSection(`#${category}`);
    }

    handleNewsletter(e) {
        const emailInput = e.target.querySelector('input[type="email"]');
        if (emailInput && emailInput.value) {
            this.showNotification('Thanks for subscribing to our newsletter!', 'success');
            e.target.reset();
        }
    }

    clearCart() {
        this.cart = [];
        this.updateCartCount();
        this.renderCartItems();
    }

    // === LOCAL STORAGE ===
    saveToLocalStorage() {
        localStorage.setItem('palmerDrips_cart', JSON.stringify(this.cart));
        localStorage.setItem('palmerDrips_wishlist', JSON.stringify(this.wishlist));
        localStorage.setItem('palmerDrips_orders', JSON.stringify(this.orders));
    }

    loadFromLocalStorage() {
        const savedCart = localStorage.getItem('palmerDrips_cart');
        const savedWishlist = localStorage.getItem('palmerDrips_wishlist');
        const savedOrders = localStorage.getItem('palmerDrips_orders');
        
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
        
        if (savedWishlist) {
            this.wishlist = JSON.parse(savedWishlist);
        }
        
        if (savedOrders) {
            this.orders = JSON.parse(savedOrders);
        }
        
        this.updateCartCount();
        this.updateWishlistCount();
    }

    // === NOTIFICATIONS ===
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    // === DEBUG METHODS ===
    debugApp() {
        console.log('=== APP DEBUG ===');
        console.log('Products:', this.products.length);
        console.log('Cart items:', this.cart.length);
        console.log('Wishlist items:', this.wishlist.length);
        console.log('Orders:', this.orders.length);
        console.log('=== END DEBUG ===');
    }

    reloadProducts() {
        this.renderAllProducts();
        this.showNotification('Products reloaded!', 'success');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PalmerDripsApp();
    
    // Save data before page unload
    window.addEventListener('beforeunload', () => {
        app.saveToLocalStorage();
    });
    
    // Add debug buttons for development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const debugDiv = document.createElement('div');
        debugDiv.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 5px;
        `;
        debugDiv.innerHTML = `
            <button onclick="app.debugApp()" style="background: #007bff; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer;">
                Debug App
            </button>
            <button onclick="app.reloadProducts()" style="background: #28a745; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer;">
                Reload Products
            </button>
        `;
        document.body.appendChild(debugDiv);
    }
});