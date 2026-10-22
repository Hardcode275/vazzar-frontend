import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CheckoutModal from '../components/CheckoutModal';
import { api } from '../services/api';
import { 
  Sparkles, 
  Store, 
  MapPin, 
  Mail, 
  User, 
  CheckCircle, 
  ExternalLink, 
  X, 
  Eye, 
  ShoppingBag,
  Clock,
  Radio,
  Filter
} from 'lucide-react';

export default function FairPage() {
  const [stands, setStands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPavilion, setSelectedPavilion] = useState('ALL');
  const [activeStandModal, setActiveStandModal] = useState(null);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleBuyFromStand = (product) => {
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  };

  useEffect(() => {
    loadStands();
  }, []);

  const loadStands = async () => {
    setLoading(true);
    try {
      const data = await api.getFairStands();
      setStands(data || []);
    } catch (e) {
      console.error('Error cargando stands:', e);
      setStands([]);
    } finally {
      setLoading(false);
    }
  };

  const pavilions = [
    { id: 'ALL', label: '🎪 Todos los Puestos' },
    { id: 'Tecnología & Móviles', label: '📱 Tecnología & Móviles' },
    { id: 'Calzado & Cuero', label: '👞 Calzado & Cuero' },
    { id: 'Café & Gourmet', label: '☕ Café & Gourmet' },
    { id: 'Moda & Accesorios', label: '👔 Moda & Accesorios' },
  ];

  const filteredStands = stands.filter((stand) => {
    if (selectedPavilion === 'ALL') return true;
    return stand.pavilion === selectedPavilion;
  });

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="content-container">
        {/* Banner Superior Estilo Pabellón de Feria */}
        <div className="fair-expo-hero">
          <div className="fair-live-indicator">
            <span className="live-dot"></span>
            <span className="live-text">EN VIVO AHORA</span>
            <span className="live-sep">•</span>
            <span>Edición Emprendedores 2026</span>
          </div>

          <h2>🎪 Gran Pabellón de la Feria Virtual</h2>
          <p className="fair-expo-sub">
            Recorre los puestos oficiales de nuestros comerciantes y marcas participantes. Cada comerciante atiende desde su stand virtual propio con catálogo exclusivo.
          </p>

          <div className="fair-stats-row">
            <div className="fair-stat-chip">
              <Store size={15} />
              <span><strong>{stands.length} Puestos</strong> Disponibles</span>
            </div>
            <div className="fair-stat-chip">
              <Radio size={15} color="#10b981" />
              <span><strong>Comerciantes</strong> Atendiendo en Vivo</span>
            </div>
            <div className="fair-stat-chip">
              <Clock size={15} />
              <span><strong>Horario:</strong> 8:00 AM - 9:00 PM</span>
            </div>
          </div>
        </div>

        {/* Filtros por Pabellón */}
        <div className="pavilion-filter-bar">
          <span className="filter-label"><Filter size={14} /> Pabellones:</span>
          <div className="pavilion-pills">
            {pavilions.map((p) => (
              <button
                key={p.id}
                className={`pavilion-pill ${selectedPavilion === p.id ? 'active' : ''}`}
                onClick={() => setSelectedPavilion(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Puestos de Comerciantes (Stands) */}
        {loading ? (
          <div className="fair-loading-box">
            <div className="spinner-fair"></div>
            <p>Conectando con los puestos de los comerciantes...</p>
          </div>
        ) : filteredStands.length === 0 ? (
          <div className="empty-fair-box">
            <Store size={44} />
            <p>No hay puestos disponibles en este pabellón.</p>
          </div>
        ) : (
          <div className="stands-grid">
            {filteredStands.map((stand) => (
              <div key={stand.id} className="stand-booth-card">
                {/* Toldo decorativo del Stand */}
                <div 
                  className="stand-canopy" 
                  style={{ 
                    background: `repeating-linear-gradient(45deg, ${stand.canopyColor}, ${stand.canopyColor} 18px, #1e293b 18px, #1e293b 36px)` 
                  }}
                >
                  <div className="canopy-scallop"></div>
                  <span className="stand-number-badge">{stand.standNumber}</span>
                  <span className="stand-pavilion-badge">{stand.pavilion}</span>
                </div>

                {/* Cabecera del Puesto */}
                <div className="stand-body">
                  <div className="stand-merchant-profile">
                    <img 
                      src={stand.logoUrl} 
                      alt={stand.name} 
                      className="merchant-avatar"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200'; }}
                    />
                    <div className="merchant-info">
                      <h3 className="stand-name">{stand.name}</h3>
                      <div className="merchant-name-line">
                        <User size={13} />
                        <span>Comerciante: <strong>{stand.merchantName}</strong></span>
                      </div>
                      <div className="merchant-contact-line">
                        <Mail size={13} />
                        <code>{stand.contact}</code>
                      </div>
                    </div>
                  </div>

                  <p className="stand-description">{stand.description}</p>

                  {/* Vitrina / Mostrador de Productos del Stand */}
                  <div className="stand-showcase-preview">
                    <div className="showcase-header">
                      <span>Mostrador del Puesto ({stand.products?.length || 0} artículos)</span>
                      <span className="live-status-chip">🟢 Abierto</span>
                    </div>

                    <div className="showcase-thumbnails">
                      {stand.products && stand.products.length > 0 ? (
                        stand.products.map((p) => (
                          <div key={p.id} className="thumb-slot" title={p.name}>
                            <img 
                              src={p.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'} 
                              alt={p.name}
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'; }}
                            />
                            <span className="thumb-label">{p.name}</span>
                          </div>
                        ))
                      ) : (
                        <div className="empty-thumbs">Preparando exhibición...</div>
                      )}
                    </div>
                  </div>

                  {/* Botón de Entrada al Puesto */}
                  <div className="stand-card-footer">
                    <button 
                      className="btn-enter-stand"
                      onClick={() => setActiveStandModal(stand)}
                    >
                      <Eye size={16} /> Entrar y Visitar Puesto
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal / Vista Inmersiva del Puesto del Comerciante */}
        {activeStandModal && (
          <div className="stand-modal-backdrop" onClick={() => setActiveStandModal(null)}>
            <div className="stand-modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div 
                className="modal-stand-canopy" 
                style={{ 
                  background: `repeating-linear-gradient(45deg, ${activeStandModal.canopyColor}, ${activeStandModal.canopyColor} 24px, #0f172a 24px, #0f172a 48px)` 
                }}
              >
                <div className="modal-stand-header-content">
                  <span className="stand-number-badge-large">{activeStandModal.standNumber}</span>
                  <h2>{activeStandModal.name}</h2>
                  <span className="pavilion-tag-large">{activeStandModal.pavilion}</span>
                </div>
                <button className="btn-close-modal" onClick={() => setActiveStandModal(null)}>
                  <X size={22} />
                </button>
              </div>

              <div className="modal-stand-body">
                {/* Info del Comerciante */}
                <div className="modal-merchant-card">
                  <img 
                    src={activeStandModal.logoUrl} 
                    alt={activeStandModal.name} 
                    className="modal-merchant-avatar"
                  />
                  <div className="modal-merchant-details">
                    <div className="merchant-label">Puesto Oficial en Feria</div>
                    <h4>{activeStandModal.merchantName}</h4>
                    <p className="merchant-bio">{activeStandModal.description}</p>
                    <div className="contact-action-bar">
                      <span className="contact-badge-item">
                        <Mail size={14} /> {activeStandModal.contact}
                      </span>
                      <span className="contact-badge-item status-live-badge">
                        🟢 Atendiendo al público
                      </span>
                    </div>
                  </div>
                </div>

                {/* Catálogo de Productos exhibidos en este Puesto */}
                <div className="modal-showcase-section">
                  <h3>Artículos exhibidos en el mostrador ({activeStandModal.products?.length || 0}):</h3>

                  <div className="modal-products-grid">
                    {activeStandModal.products && activeStandModal.products.length > 0 ? (
                      activeStandModal.products.map((prod) => (
                        <div key={prod.id} className="modal-product-card">
                          <img 
                            src={prod.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'} 
                            alt={prod.name}
                            className="modal-prod-img"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'; }}
                          />
                          <div className="modal-prod-info">
                            <h4>{prod.name}</h4>
                            <p>{prod.description || 'Artículo oficial de exhibición disponible durante la feria.'}</p>
                            <div className="modal-prod-buy-row">
                              <span className="modal-prod-price">${Number(prod.price || 0).toFixed(2)}</span>
                              <button 
                                className="btn btn-primary btn-sm btn-buy-booth"
                                onClick={() => handleBuyFromStand(prod)}
                              >
                                <ShoppingBag size={14} /> Comprar en Stand
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">Este puesto aún no ha colocado artículos en su vitrina.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-stand-footer">
                <button className="btn btn-secondary" onClick={() => setActiveStandModal(null)}>
                  Salir del Puesto
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Pago y Facturación desde la Feria */}
        <CheckoutModal 
          isOpen={isCheckoutOpen}
          onClose={() => { setIsCheckoutOpen(false); setCheckoutProduct(null); }}
          cartItems={checkoutProduct ? [{
            id: checkoutProduct.id,
            name: checkoutProduct.name,
            price: checkoutProduct.price || 0,
            qty: 1
          }] : []}
          cartTotal={checkoutProduct ? (checkoutProduct.price || 0) : 0}
          onSuccess={() => {}}
          sourceChannel="fair"
        />
      </main>
    </div>
  );
}
