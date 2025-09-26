// StyleHub E-commerce Application
class StyleHubApp {
    constructor() {
        this.products = [];
        this.cart = [];
        this.wishlist = [];
        this.currentView = 'featured';
        this.apiBase = 'http://localhost:3000';
        
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupEventListeners();
        this.renderProducts();
        this.updateCartCount();
        this.updateWishlistCount();
    }

    // Load products from JSON Server
    async loadProducts() {
        try {
            const response = await fetch(`${this.apiBase}/products`);
            if (!response.ok) throw new Error('Failed to load products');
            
            this.products = await response.json();
            console.log('Loaded products:', this.products);
        } catch (error) {
            console.error('Error loading products:', error);
            this.loadSampleProducts();
        }
    }

    // Fallback if JSON Server is not running
    loadSampleProducts() {
        this.products = [
            {
                id: 1,
                name: "Sample Sneaker",
                brand: "Nike",
                price: 2500,
                category: "sneakers",
                images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"],
                featured: true,
                description: "Sample product description"
            },
            {
                id: 2,
                name: "Sample Clothing",
                brand: "Adidas",
                price: 1700,
                category: "clothing",
                images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"],
                featured: true,
                description: "Sample clothing item"
            }
        ];
        console.log('Using sample products');
    }

    setupEventListeners() {
        // Cart functionality
        document.querySelector('.cart-btn').addEventListener('click', () => this.toggleCart());
        document.querySelector('.cart-close').addEventListener('click', () => this.toggleCart());
        
        // Search functionality
        document.querySelector('.search-btn').addEventListener('click', () => this.toggleSearch());
        document.querySelector('.search-close').addEventListener('click', () => this.toggleSearch());
        
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(link.getAttribute('href'));
            });
        });
        
        // Newsletter form
        document.querySelector('.newsletter-form').addEventListener('submit', (e) => {
            this.handleNewsletter(e);
        });

        // Menu toggle for mobile
        document.querySelector('.menu-toggle').addEventListener('click', () => {
            this.toggleMobileMenu();
        });
    }

    renderProducts() {
        this.renderFeaturedProducts();
        this.renderSneakers();
        this.renderClothing();
    }

    renderFeaturedProducts() {
        const container = document.getElementById('featured-products');
        const featuredProducts = this.products.filter(p => p.featured).slice(0, 4);
        
        if (featuredProducts.length === 0) {
            container.innerHTML = '<div class="loading">No featured products found</div>';
            return;
        }
        
        container.innerHTML = featuredProducts.map(product => this.createProductCard(product)).join('');
        this.attachProductEvents();
    }
    renderSneakers() {
        const container = document.getElementById('sneakers-products');
        const sneakers = this.products.filter(p => p.category === 'sneakers');
        
        if (sneakers.length === 0) {
            container.innerHTML = '<div class="loading">No sneakers found</div>';
            return;
        }
        
        container.innerHTML = sneakers.map(product => this.createProductCard(product)).join('');
        this.attachProductEvents();
    }

    renderClothing() {
        const container = document.getElementById('clothing-products');
        const clothing = this.products.filter(p => p.category === 'clothing');
        
        if (clothing.length === 0) {
            container.innerHTML = '<div class="loading">No clothing found</div>';
            return;
        }
        
        container.innerHTML = clothing.map(product => this.createProductCard(product)).join('');
        this.attachProductEvents();
    }

    createProductCard(product) {
        const mainImage = product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        
        return `
            <div class="product-card" data-id="${product.id}">
                ${product.featured ? '<span class="product-badge">Featured</span>' : ''}
                
                <div class="product-image">
                    <img src="${mainImage}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'">
                    <div class="product-actions">
                        <button class="product-action-btn wishlist-btn" data-id="${product.id}">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
                
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-brand">${product.brand}</p>
                    <div class="product-price">
                        Ksh ${product.price.toLocaleString()}
                    </div>
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        `;
    }

    attachProductEvents() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.id);
                this.addToCart(productId);
            });
        });
        
        // Wishlist buttons
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.wishlist-btn').dataset.id);
                this.toggleWishlist(productId);
            });
        });
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }
        
        this.updateCartCount();
        this.showNotification(`${product.name} added to cart! Price: Ksh ${product.price.toLocaleString()}`, 'success');
    }

    toggleWishlist(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const index = this.wishlist.findIndex(item => item.id === productId);
        const btn = document.querySelector(`.wishlist-btn[data-id="${productId}"] i`);
        
        if (index > -1) {
            this.wishlist.splice(index, 1);
            btn.className = 'far fa-heart';
            this.showNotification(`${product.name} removed from wishlist`, 'info');
        } else {
            this.wishlist.push(product);
            btn.className = 'fas fa-heart';
            this.showNotification(`${product.name} added to wishlist! Price: Ksh ${product.price.toLocaleString()}`, 'success');
        }
        
        this.updateWishlistCount();
    }

    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelector('.cart-count').textContent = totalItems;
        this.renderCartItems();
    }

    updateWishlistCount() {
        document.querySelector('.wishlist-count').textContent = this.wishlist.length;
    }

    renderCartItems() {
        const container = document.getElementById('cart-items');
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (this.cart.length === 0) {
            container.innerHTML = '<p class="loading">Your cart is empty</p>';
        } else {
            container.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <img src="${item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <p class="cart-item-price">Ksh ${item.price.toLocaleString()} × ${item.quantity}</p>
                        <div class="cart-item-actions">
                            <button class="quantity-btn" onclick="app.updateQuantity(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="app.updateQuantity(${item.id}, 1)">+</button>
                            <button class="remove-btn" onclick="app.removeFromCart(${item.id})">Remove</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        document.getElementById('cart-total-price').textContent = `Ksh ${total.toLocaleString()}`;
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;
        
        item.quantity += change;
        
        if (item.quantity <= 0) {
            this.removeFromCart(productId);
        } else {
            this.updateCartCount();
        }
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartCount();
        this.showNotification('Item removed from cart', 'info');
    }

    toggleCart() {
        document.querySelector('.cart-overlay').classList.toggle('active');
    }

    toggleSearch() {
        document.querySelector('.search-overlay').classList.toggle('active');
    }

    toggleMobileMenu() {
        document.querySelector('.nav-menu').classList.toggle('active');
    }

    handleNavigation(section) {
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        event.target.classList.add('active');
        
        this.scrollToSection(section);
        
        // Close mobile menu if open
        if (document.querySelector('.nav-menu').classList.contains('active')) {
            this.toggleMobileMenu();
        }
    }

    scrollToSection(section) {
        const targetElement = document.querySelector(section);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }

    filterByCategory(category) {
        this.scrollToCategory(category);
    }

    scrollToCategory(category) {
        let section;
        switch(category) {
            case 'sneakers':
                section = '#sneakers';
                break;
            case 'clothing':
                section = '#clothing';
                break;
            default:
                section = '#new-arrivals';
        }
        this.scrollToSection(section);
    }

    handleNewsletter(e) {
        e.preventDefault();
        const email = e.target.querySelector('input').value;
        if (email) {
            this.showNotification('Thanks for subscribing to our newsletter!', 'success');
            e.target.reset();
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    // Search functionality
    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        const searchClose = document.querySelector('.search-close');
        
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(searchInput.value);
            }
        });
        
        searchClose.addEventListener('click', () => {
            this.toggleSearch();
            this.clearSearch();
        });
    }

    handleSearch(searchTerm) {
        if (searchTerm.length > 2) {
            this.performSearch(searchTerm);
        } else if (searchTerm.length === 0) {
            this.clearSearch();
        }
    }

    performSearch(searchTerm) {
        const searchResults = this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        this.displaySearchResults(searchResults);
    }

    displaySearchResults(results) {
        // You can implement a search results overlay or page here
        console.log('Search results:', results);
    }

    clearSearch() {
        document.querySelector('.search-input').value = '';
        // Clear search results display
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new StyleHubApp();
});

// Add CSS animations
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { 
                transform: translateX(100%); 
                opacity: 0; 
            }
            to { 
                transform: translateX(0); 
                opacity: 1; 
            }
        }
        
        @keyframes fadeIn {
            from { 
                opacity: 0; 
                transform: translateY(-20px);
            }
            to { 
                opacity: 1; 
                transform: translateY(0);
            }
        }
        
        .notification {
            animation: slideIn 0.3s ease;
        }
        
        .product-card {
            animation: fadeIn 0.5s ease;
        }
        
        /* Mobile menu styles */
        @media (max-width: 768px) {
            .nav-menu {
                position: fixed;
                top: 80px;
                left: -100%;
                width: 100%;
                height: calc(100vh - 80px);
                background: var(--background);
                flex-direction: column;
                padding: var(--spacing-xl);
                transition: left 0.3s ease;
                z-index: 999;
            }
            
            .nav-menu.active {
                left: 0;
            }
            
            .nav-menu .nav-link {
                padding: var(--spacing-md) 0;
                font-size: var(--font-size-lg);
                border-bottom: 1px solid var(--border);
            }
        }
    `;
    document.head.appendChild(style);
});