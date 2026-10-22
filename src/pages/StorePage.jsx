import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CheckoutModal from '../components/CheckoutModal';
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
  Filter,
  Package
} from 'lucide-react';

export default function StorePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado del Carrito
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
    setIsCartOpen(false);
  };

  // Filtrado de productos
  const filteredProducts = products.filter((prod) => {
    const matchesCat = selectedCategory === 'ALL' || prod.categoryId === selectedCategory;
    const matchesSearch = 
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Mapear nombre de categoría por id
  const getCategoryName = (catId) => {
    const found = categories.find((c) => c.id === catId);
    return found ? found.name : 'General';
  };

  return (
    <div className="store-page-wrapper">
      <Navbar 
        cartCount={cartItemCount} 
        onOpenCart={() => setIsCartOpen(true)} 
      />

      {/* Hero Banner Solid */}
      <section className="store-hero-solid">
        <div className="hero-content-solid">
          <span className="hero-tag-solid"><Sparkles size={15} /> Catálogo Oficial Vazzar</span>
          <h2>Tienda Online y Productos de Alta Calidad</h2>
          <p>
            Explora las colecciones creadas directamente por nuestros vendedores en PostgreSQL y sincronizadas en tiempo real.
          </p>
        </div>
      </section>

      {/* Controles de Búsqueda y Filtros */}
      <div className="store-filter-bar">
        <div className="search-box-solid">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por calzado, ropa, accesorios, café..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="categories-pill-carousel">
          <button 
            className={`pill-btn ${selectedCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            Todas ({products.length})
          </button>
          {categories.map((c) => (
            <button 
              key={c.id} 
              className={`pill-btn ${selectedCategory === c.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Catálogo de Productos */}
      <main className="store-content-area">
        {loading ? (
          <div className="store-loading">Cargando productos de la tienda...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-catalog-box">
            <Filter size={36} />
            <p>No se encontraron productos para esta categoría o búsqueda.</p>
          </div>
        ) : (
          <div className="store-grid-solid">
            {filteredProducts.map((p) => (
              <div key={p.id} className="store-product-card-solid">
                <div className="product-image-container">
                  {p.imageUrl ? (
                    <img 
                      src={p.imageUrl} 
                      alt={p.name}
                      className="product-img"
                      onError={(e) => { 
                        e.target.style.display = 'none';
                        if (e.target.nextElementSibling) {
                          e.target.nextElementSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className="product-img-fallback-box"
                    style={{ display: p.imageUrl ? 'none' : 'flex' }}
                  >
                    <Package size={40} strokeWidth={1.5} style={{ opacity: 0.5, marginBottom: '6px' }} />
                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Sin fotografía</span>
                  </div>
                  <span className="cat-floating-pill">
                    {getCategoryName(p.categoryId)}
                  </span>
                </div>

                <div className="product-body-solid">
                  <h3 className="product-card-title">{p.name}</h3>
                  <p className="product-card-desc">{p.description || 'Producto premium disponible para entrega inmediata.'}</p>

                  <div className="product-card-bottom">
                    <div className="price-tag">${Number(p.price).toFixed(2)}</div>
                    <button 
                      className="btn-add-cart-solid" 
                      onClick={() => addToCart(p)}
                    >
                      <Plus size={16} /> Agregar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Carrito Lateral (Drawer) */}
      {isCartOpen && (
        <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer-solid" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <div className="cart-title">
                <ShoppingCart size={20} />
                <h3>Tu Carrito ({cartItemCount})</h3>
              </div>
              <button className="btn-close-cart" onClick={() => setIsCartOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart-view">
                <ShoppingBag size={48} />
                <p>Tu carrito está vacío.</p>
                <button className="btn btn-primary" onClick={() => setIsCartOpen(false)}>
                  Explorar Tienda
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items-container">
                  {cart.map((item) => (
                    <div key={item.id} className="cart-item-card-solid">
                      <img 
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'} 
                        alt={item.name} 
                        className="cart-item-img"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'; }}
                      />
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <span className="cart-item-price">${Number(item.price).toFixed(2)} c/u</span>

                        <div className="qty-control-row">
                          <button onClick={() => updateQty(item.id, -1)} className="btn-qty-btn">
                            <Minus size={14} />
                          </button>
                          <span className="qty-number">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="btn-qty-btn">
                            <Plus size={14} />
                          </button>
                          <button onClick={() => removeFromCart(item.id)} className="btn-remove-item" title="Quitar">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <div className="cart-item-subtotal">
                        ${(item.price * item.qty).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-footer-solid">
                  <div className="cart-summary-row">
                    <span>Subtotal:</span>
                    <strong>${cartTotal.toFixed(2)}</strong>
                  </div>
                  <div className="cart-summary-row total-row">
                    <span>Total Estimado:</span>
                    <strong className="final-total">${cartTotal.toFixed(2)}</strong>
                  </div>
                  <button className="btn btn-primary btn-checkout-action" onClick={handleCheckout}>
                    Confirmar Pedido <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de Pago y Facturación Electrónica */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        cartTotal={cartTotal}
        onSuccess={() => setCart([])}
        sourceChannel="ecommerce"
      />
    </div>
  );
}
