// E-commerce Application
class StyleHub {
    constructor() {
        this.cart = [];
        this.products = [];
        this.categories = [];
        this.init();
    }

    // Initialize the application
    init() {
        this.setupEventListeners();
        this.loadProducts();
        this.loadCategories();
        this.updateCartUI();
    }

    // Setup all event listeners
    setupEventListeners() {
        // Cart functionality
        document.getElementById('cart-icon').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleCart();
        });

        document.getElementById('close-cart').addEventListener('click', () => {
            this.closeCart();
        });

        // Newsletter form
        document.getElementById('newsletter-form').addEventListener('submit', (e) => {
            this.handleNewsletterSubmit(e);
        });

        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            const cartModal = document.getElementById('cart-modal');
            const cartIcon = document.getElementById('cart-icon');
            
            if (cartModal.classList.contains('open') && 
                !cartModal.contains(e.target) && 
                !cartIcon.contains(e.target)) {
                this.closeCart();
            }
        });
    }

    // Load products from JSON file
    async loadProducts() {
        try {
            const response = await fetch('./data/products.json');
            if (!response.ok) throw new Error('Failed to load products');
            
            const data = await response.json();
            this.products = data.products;
            this.renderProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            this.loadSampleProducts();
        }
    }

    // Load categories
    async loadCategories() {
        try {
            const response = await fetch('./data/products.json');
            if (!response.ok) throw new Error('Failed to load categories');
            
            const data = await response.json();
            this.categories = data.categories;
            this.renderCategories();
        } catch (error) {
            console.error('Error loading categories:', error);
            this.loadSampleCategories();
        }
    }

    // Render products to the DOM
    renderProducts() {
        const container = document.getElementById('products-container');
        
        if (this.products.length === 0) {
            container.innerHTML = '<div class="loading">No products available</div>';
            return;
        }

        container.innerHTML = this.products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                    ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">$${product.price}</p>
                    <div class="product-actions">
                        <button class="add-to-cart" 
                                data-id="${product.id}"
                                data-name="${product.name}"
                                data-price="${product.price}"
                                data-image="${product.image}">
                            Add to Cart
                        </button>
                        <button class="wishlist">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        this.setupProductInteractions();
    }

    // Render categories to the DOM
    renderCategories() {
        const container = document.getElementById('categories-container');
        
        container.innerHTML = this.categories.map(category => `
            <div class="category-card">
                <img src="${category.image}" alt="${category.name}">
                <div class="category-card-overlay">
                    <h3>${category.name}</h3>
                </div>
            </div>
        `).join('');

        // Add click events to categories
        document.querySelectorAll('.category-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                this.filterByCategory(this.categories[index].name);
            });
        });
    }

    // Setup product interactions
    setupProductInteractions() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const product = {
                    id: e.target.dataset.id,
                    name: e.target.dataset.name,
                    price: parseFloat(e.target.dataset.price),
                    image: e.target.dataset.image,
                    quantity: 1
                };
                this.addToCart(product);
            });
        });

        // Wishlist buttons
        document.querySelectorAll('.wishlist').forEach(button => {
            button.addEventListener('click', (e) => {
                this.toggleWishlist(e.target);
            });
        });
    }

    // Cart functionality
    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push(product);
        }
        
        this.updateCartUI();
        this.showNotification(`${product.name} added to cart!`);
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartUI();
    }

    updateCartUI() {
        const cartCount = document.querySelector('.cart-count');
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');

        // Update cart count
        const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Update cart items
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">$${item.price} x ${item.quantity}</div>
                    </div>
                    <button class="remove-item" data-id="${item.id}">&times;</button>
                </div>
            `).join('');

            // Add event listeners to remove buttons
            document.querySelectorAll('.remove-item').forEach(button => {
                button.addEventListener('click', (e) => {
                    this.removeFromCart(e.target.dataset.id);
                });
            });
        }

        // Update total
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    }

    // Cart modal controls
    toggleCart() {
        document.getElementById('cart-modal').classList.toggle('open');
    }

    closeCart() {
        document.getElementById('cart-modal').classList.remove('open');
    }

    // Wishlist functionality
    toggleWishlist(button) {
        const icon = button.querySelector('i');
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            button.style.color = '#e63946';
            this.showNotification('Added to wishlist!');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            button.style.color = '#6c757d';
            this.showNotification('Removed from wishlist!');
        }
    }

    // Filter products by category
    filterByCategory(category) {
        const filteredProducts = this.products.filter(product => 
            product.category === category
        );
        
        // For demo purposes, we'll just show an alert
        this.showNotification(`Showing ${category} products`);
        
        // In a real app, you would re-render the products grid
        // this.renderProducts(filteredProducts);
    }

    // Newsletter form handling
    handleNewsletterSubmit(e) {
        e.preventDefault();
        const emailInput = e.target.querySelector('input');
        const email = emailInput.value.trim();

        if (this.isValidEmail(email)) {
            this.showNotification('Thanks for subscribing to our newsletter!');
            emailInput.value = '';
        } else {
            this.showNotification('Please enter a valid email address.', 'error');
        }
    }

    // Utility functions
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f8d7da' : '#d4edda'};
            color: ${type === 'error' ? '#721c24' : '#155724'};
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Fallback data
    loadSampleProducts() {
        this.products = [
            {
                id: "1",
                name: "JB Jason Signature Sneakers",
                price: 129.99,
                image: "https://images.unsplash.com/photo-1588117305388-c2631a279f82?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "Sneakers",
                badge: "JB Jason"
            },
            {
                id: "2",
                name: "Premium Denim Jacket",
                price: 89.99,
                image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "Clothing"
            },
            {
                id: "3",
                name: "Summer Floral Dress",
                price: 59.99,
                image: "https://images.unsplash.com/photo-1583744946564-b52ae1c3c559?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "Clothing"
            },
            {
                id: "4",
                name: "JB Jason Sport Edition",
                price: 99.99,
                image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "Sneakers",
                badge: "JB Jason"
            }
        ];
        this.renderProducts();
    }

    loadSampleCategories() {
        this.categories = [
            {
                name: "Men's Clothing",
                image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            },
            {
                name: "Women's Clothing",
                image: "https://images.unsplash.com/photo-1529903384028-929ae5dccdf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            },
            {
                name: "Sneakers",
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            },
            {
                name: "Accessories",
                image: "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            }
        ];
        this.renderCategories();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StyleHub();
});