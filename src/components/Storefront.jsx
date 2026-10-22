import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  ShoppingBag, 
  Search, 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';

export default function Storefront({ onGoToPortal, user }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado del Carrito
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        api.getEcommerceCategories(),
        api.getEcommerceProducts()
      ]);
      setCategories(cats || []);
      setProducts(prods || []);
    } catch (e) {
      console.error('Error cargando tienda:', e);
    } finally {
      setLoading(false);
    }
  };

  // Carrito actions
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const cartTotal = cart.reduce((acc, item) => acc + parseFloat(item.price) * item.qty, 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    setCart([]);
    setTimeout(() => {
      setCheckoutSuccess(false);
      setIsCartOpen(false);
    }, 3500);
  };

  // Filtrado de productos
  const filteredProducts = products.filter((prod) => {
    const matchesCat = selectedCategory === 'ALL' || prod.categoryId === selectedCategory;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="store-container">
      {/* Barra de Navegación de la Tienda */}
      <header className="store-header">
        <div className="store-brand">
          <div className="store-logo">V</div>
          <div>
            <h1 className="store-title">Vazzar Storefront</h1>
            <span className="store-badge">Tienda Online Oficial (Ecommerce)</span>
          </div>
        </div>

        <div className="store-actions">
          {/* Botón Carrito */}
          <button className="btn-cart" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart size={20} />
            <span>Carrito</span>
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </button>

          {/* Botón para alternar al Portal de Gestión */}
          <button className="btn btn-secondary btn-portal" onClick={onGoToPortal}>
            <span>⚙️ Portal de Gestión</span>
            {user && <span className="user-role-pill">{user.role}</span>}
          </button>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="store-hero">
        <div className="hero-content">
          <span className="hero-tag"><Sparkles size={16} /> Nuevos Productos 2026</span>
          <h2>Productos Exclusivos Directo del Productor</h2>
          <p>Catálogo centralizado alojado en PostgreSQL y sincronizado en tiempo real por Eventos de Dominio.</p>
        </div>
      </section>

      {/* Controles de Búsqueda y Filtros de Categoría */}
      <div className="store-controls">
        <div className="search-wrap">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por calzado, café, ropa, accesorios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-filters">
          <button 
            className={`cat-pill ${selectedCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            Todos ({products.length})
          </button>
          {categories.map((c) => (
            <button 
              key={c.id} 
              className={`cat-pill ${selectedCategory === c.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Productos */}
      {loading ? (
        <div className="store-loading">
          <p>Cargando catálogo desde PostgreSQL (esquema ecommerce)...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="store-empty">
          <ShoppingBag size={48} className="text-muted" />
          <h3>No se encontraron productos</h3>
          <p className="text-muted">Intenta con otra búsqueda o selecciona otra categoría.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((p) => (
            <div key={p.id} className="product-card">
              <div className="product-image-wrap">
                <img 
                  src={p.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'} 
                  alt={p.name}
                  className="product-image"
                />
                <span className="stock-tag">🟢 En Stock</span>
              </div>
              <div className="product-info">
                <h3 className="product-title">{p.name}</h3>
                <p className="product-description">{p.description || 'Producto premium garantizado.'}</p>
                
                <div className="product-footer">
                  <div className="product-price">${parseFloat(p.price).toFixed(2)}</div>
                  <button className="btn btn-primary btn-add-cart" onClick={() => addToCart(p)}>
                    <Plus size={16} /> Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer / Modal del Carrito */}
      {isCartOpen && (
        <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShoppingCart size={22} color="var(--primary)" />
                <h3>Tu Carrito ({cartItemCount})</h3>
              </div>
              <button className="btn-close" onClick={() => setIsCartOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {checkoutSuccess ? (
              <div className="checkout-success-view">
                <CheckCircle2 size={56} color="var(--success)" />
                <h3>¡Orden Recibida con Éxito!</h3>
                <p>Tu pedido ha sido procesado por el Bounded Context de Ecommerce.</p>
              </div>
            ) : cart.length === 0 ? (
              <div className="cart-empty-view">
                <ShoppingBag size={44} className="text-muted" />
                <p>Tu carrito está vacío.</p>
                <button className="btn btn-secondary" onClick={() => setIsCartOpen(false)}>
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items-list">
                  {cart.map((item) => (
                    <div key={item.id} className="cart-item">
                      <img src={item.imageUrl} alt={item.name} className="cart-item-img" />
                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <div className="cart-item-price">${parseFloat(item.price).toFixed(2)}</div>
                        <div className="cart-item-controls">
                          <button className="btn-qty" onClick={() => updateQty(item.id, -1)}>
                            <Minus size={14} />
                          </button>
                          <span>{item.qty}</span>
                          <button className="btn-qty" onClick={() => updateQty(item.id, 1)}>
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      <button className="btn-item-delete" onClick={() => removeFromCart(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="cart-summary-row">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="cart-summary-row">
                    <span>Envío</span>
                    <span style={{ color: 'var(--success)' }}>Gratis</span>
                  </div>
                  <div className="cart-total-row">
                    <span>Total a Pagar</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <button className="btn btn-primary btn-checkout" onClick={handleCheckout}>
                    Confirmar Pedido <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
