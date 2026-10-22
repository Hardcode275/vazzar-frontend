import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { 
  Sparkles, 
  Store, 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Layers, 
  Eye, 
  Package, 
  Palette,
  ExternalLink,
  X
} from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Índigo Real', hex: '#6366f1' },
  { name: 'Naranja Fuego', hex: '#ea580c' },
  { name: 'Esmeralda', hex: '#059669' },
  { name: 'Azul Océano', hex: '#0284c7' },
  { name: 'Púrpura Místico', hex: '#9333ea' },
  { name: 'Rubí Intenso', hex: '#e11d48' },
  { name: 'Ámbar Dorado', hex: '#d97706' },
  { name: 'Grafito Sólido', hex: '#334155' }
];

const PAVILIONS = [
  'Tecnología & Móviles',
  'Calzado & Cuero',
  'Café & Gourmet',
  'Moda & Accesorios',
  'Hogar & Decoración',
  'Artesanías & Joyería',
  'Salud & Belleza'
];

export default function MyStandPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stand, setStand] = useState(null);
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [notification, setNotification] = useState(null);

  // Stand Form State
  const [standName, setStandName] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [standNumber, setStandNumber] = useState('');
  const [pavilion, setPavilion] = useState(PAVILIONS[0]);
  const [canopyColor, setCanopyColor] = useState('#6366f1');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Add Product to Stand Modal/Drawer State
  const [showAddModal, setShowAddModal] = useState(false);
  const [prodSource, setProdSource] = useState('inventory'); // 'inventory' | 'custom'
  const [selectedInvId, setSelectedInvId] = useState('');
  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(29.99);
  const [newProdStock, setNewProdStock] = useState(50);
  const [newProdImageUrl, setNewProdImageUrl] = useState('');
  const [uploadingProdImg, setUploadingProdImg] = useState(false);

  const notify = (msg, isError = false) => {
    setNotification({ msg, isError });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [standData, invProds] = await Promise.all([
        api.getMyStand(user.email),
        api.getProducts().catch(() => [])
      ]);

      setInventoryProducts(invProds || []);

      if (standData) {
        setStand(standData);
        setStandName(standData.name || '');
        setMerchantName(standData.merchantName || user.email);
        setStandNumber(standData.standNumber || '');
        setPavilion(standData.pavilion || PAVILIONS[0]);
        setCanopyColor(standData.canopyColor || '#6366f1');
        setDescription(standData.description || '');
        setLogoUrl(standData.logoUrl || '');
      } else {
        // Valores sugeridos por defecto para crear
        setStandName(`Puesto de ${user.email.split('@')[0]}`);
        setMerchantName(user.email.split('@')[0]);
        setCanopyColor('#6366f1');
      }
    } catch (e) {
      notify('Error al cargar datos del stand: ' + e.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStand = async (e) => {
    e.preventDefault();
    if (!standName.trim()) {
      notify('Por favor indica un nombre para el stand', true);
      return;
    }

    try {
      const payload = {
        merchantEmail: user.email,
        merchantName: merchantName.trim() || user.email,
        standNumber: standNumber.trim() || undefined,
        name: standName.trim(),
        pavilion,
        canopyColor,
        description: description.trim(),
        logoUrl: logoUrl.trim() || null
      };

      if (stand && stand.id) {
        const updated = await api.updateStand(stand.id, payload);
        setStand(updated);
        notify('¡Puesto actualizado con éxito en la Feria Virtual!');
      } else {
        const created = await api.createStand(payload);
        setStand(created);
        notify('🎉 ¡Tu Stand ha sido inaugurado exitosamente en la Feria Virtual!');
      }
      await loadData();
    } catch (e) {
      notify(e.message, true);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      const res = await api.uploadImage(file);
      setLogoUrl(res.url);
      notify('Logo cargado correctamente');
    } catch (e) {
      notify('Error al subir el logo: ' + e.message, true);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleProdImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingProdImg(true);
      const res = await api.uploadImage(file);
      setNewProdImageUrl(res.url);
      notify('Foto del producto cargada correctamente');
    } catch (e) {
      notify('Error al subir imagen: ' + e.message, true);
    } finally {
      setUploadingProdImg(false);
    }
  };

  const handleSelectInventoryProduct = (prodId) => {
    setSelectedInvId(prodId);
    const prod = inventoryProducts.find(p => p.id === prodId);
    if (prod) {
      setNewProdName(prod.name || '');
      setNewProdDesc(prod.description || '');
      setNewProdPrice(prod.price || 29.99);
      setNewProdStock(prod.stock || 50);
      setNewProdImageUrl(prod.imageUrl || '');
    }
  };

  const handleAddProductToStand = async (e) => {
    e.preventDefault();
    if (!stand) {
      notify('Primero debes guardar tu stand antes de agregar productos', true);
      return;
    }
    if (!newProdName.trim()) {
      notify('El nombre del producto es obligatorio', true);
      return;
    }

    try {
      const payload = {
        productId: selectedInvId || null,
        name: newProdName.trim(),
        description: newProdDesc.trim(),
        price: parseFloat(newProdPrice) || 0,
        stock: parseInt(newProdStock) || 50,
        imageUrl: newProdImageUrl.trim() || null
      };

      await api.addStandProduct(stand.id, payload);
      notify(`✨ '${newProdName}' agregado exitosamente a la vitrina de tu Stand!`);
      setShowAddModal(false);
      // Reset form
      setSelectedInvId('');
      setNewProdName('');
      setNewProdDesc('');
      setNewProdPrice(29.99);
      setNewProdStock(50);
      setNewProdImageUrl('');
      await loadData();
    } catch (e) {
      notify(e.message, true);
    }
  };

  const handleRemoveProduct = async (productId, prodName) => {
    if (!window.confirm(`¿Retirar '${prodName}' de la vitrina de tu Stand en la feria?`)) return;
    try {
      await api.removeStandProduct(stand.id, productId);
      notify(`Producto '${prodName}' retirado de la vitrina.`);
      await loadData();
    } catch (e) {
      notify(e.message, true);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="content-container">
        {notification && (
          <div className={`notification-toast ${notification.isError ? 'error' : 'success'}`}>
            {notification.isError ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
            <span>{notification.msg}</span>
          </div>
        )}

        {/* Header Superior */}
        <div className="section-title-bar">
          <div>
            <div className="flex-row-gap">
              <h2>🎪 Mi Stand de Feria Virtual</h2>
              <span className="live-pill"><span className="pulse-dot"></span> PABELLÓN ACTIVO</span>
            </div>
            <p className="section-subtitle">
              Personaliza tu marquesina, datos de comerciante y administra directamente los productos en vitrina.
            </p>
          </div>
          <div className="flex-row-gap">
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/fair')}
              title="Ver cómo luce en la Feria Virtual pública"
            >
              <ExternalLink size={16} /> Ver en la Feria
            </button>
            <div className="active-user-badge">
              <span>Comerciante:</span>
              <strong>{user?.email}</strong>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando información de tu Stand...</p>
          </div>
        ) : (
          <div className="stand-management-layout">
            {/* Columna Izquierda: Configuración del Puesto */}
            <div className="stand-editor-card solid-card">
              <div className="card-header-styled">
                <Store size={20} />
                <h3>{stand ? 'Editar Mi Stand Oficial' : 'Inaugurar Mi Nuevo Stand'}</h3>
              </div>

              {/* Vista Previa del Toldo en tiempo real */}
              <div className="canopy-preview-box">
                <div 
                  className="stand-canopy preview-canopy"
                  style={{ '--canopy-color': canopyColor }}
                >
                  <div className="canopy-stripe"></div>
                  <div className="canopy-valance"></div>
                </div>
                <div className="canopy-preview-details">
                  <span className="canopy-preview-number">{stand?.standNumber || 'STAND #NUEVO'}</span>
                  <strong className="canopy-preview-name">{standName || 'Nombre del Puesto'}</strong>
                  <span className="canopy-preview-pavilion">Pabellón: {pavilion}</span>
                </div>
              </div>

              <form onSubmit={handleSaveStand} className="standard-form">
                <div className="form-group">
                  <label>Nombre del Puesto Comercial</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Puesto Siman Store"
                    value={standName}
                    onChange={(e) => setStandName(e.target.value)}
                    required 
                  />
                </div>

                <div className="two-col-grid">
                  <div className="form-group">
                    <label>Nombre del Comerciante / Titular</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Harold Orellana"
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Pabellón de la Feria</label>
                    <select 
                      value={pavilion} 
                      onChange={(e) => setPavilion(e.target.value)}
                      className="select-custom"
                    >
                      {PAVILIONS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selector de Color de Toldo */}
                <div className="form-group">
                  <label className="flex-row-gap">
                    <Palette size={16} /> Color del Toldo (Marquesina):
                  </label>
                  <div className="color-palette-grid">
                    {PRESET_COLORS.map(c => (
                      <button
                        type="button"
                        key={c.hex}
                        className={`color-preset-btn ${canopyColor === c.hex ? 'active' : ''}`}
                        style={{ backgroundColor: c.hex }}
                        onClick={() => setCanopyColor(c.hex)}
                        title={c.name}
                      >
                        {canopyColor === c.hex && '✓'}
                      </button>
                    ))}
                    <input 
                      type="color" 
                      value={canopyColor}
                      onChange={(e) => setCanopyColor(e.target.value)}
                      className="color-picker-input"
                      title="Elegir color personalizado"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Descripción y Biografía del Comerciante</label>
                  <textarea 
                    rows={3}
                    placeholder="Describe los productos estrella, tradición o especialidad de tu puesto..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="textarea-custom"
                  />
                </div>

                {/* Subida de Logo o Fotografía de Fachada */}
                <div className="form-group">
                  <label>Logo o Imagen de Fachada del Stand</label>
                  <div className="photo-upload-container">
                    <div className="upload-btn-row">
                      <label className="btn btn-secondary btn-file-pick">
                        <Upload size={15} />
                        {uploadingLogo ? 'Subiendo...' : 'Subir foto desde mi PC'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLogoUpload} 
                          style={{ display: 'none' }}
                          disabled={uploadingLogo}
                        />
                      </label>
                      <span className="text-divider">o ingresa una URL:</span>
                    </div>
                    <input 
                      type="url" 
                      placeholder="https://ejemplo.com/fachada.jpg"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                    />
                    {logoUrl && (
                      <div className="stand-logo-preview">
                        <img src={logoUrl} alt="Logo stand" onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-save-stand">
                  <Save size={18} /> {stand ? 'Guardar Cambios del Stand' : '🎪 Inaugurar Mi Stand'}
                </button>
              </form>
            </div>

            {/* Columna Derecha: Productos en Vitrina */}
            <div className="stand-showcase-section solid-card">
              <div className="card-header-styled justify-between">
                <div className="flex-row-gap">
                  <Layers size={20} />
                  <h3>Vitrinas y Productos en Exhibición</h3>
                </div>
                {stand && (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus size={16} /> Añadir Producto al Stand
                  </button>
                )}
              </div>

              {!stand ? (
                <div className="empty-vitrina-box">
                  <Store size={48} className="empty-icon" />
                  <h4>Inaugura tu Stand primero</h4>
                  <p>Guarda el formulario de la izquierda con los datos de tu puesto para habilitar tu vitrina de productos.</p>
                </div>
              ) : stand.products && stand.products.length > 0 ? (
                <div className="stand-products-grid">
                  {stand.products.map(prod => (
                    <div key={prod.id} className="stand-product-item-card">
                      <div className="stand-product-img-wrap">
                        {prod.imageUrl ? (
                          <img src={prod.imageUrl} alt={prod.name} />
                        ) : (
                          <div className="stand-no-img"><Package size={24} /></div>
                        )}
                        <span className="prod-price-pill">${prod.price ? Number(prod.price).toFixed(2) : '0.00'}</span>
                      </div>
                      <div className="stand-product-body">
                        <strong className="prod-title">{prod.name}</strong>
                        <p className="prod-desc">{prod.description || 'Sin descripción'}</p>
                        <div className="prod-footer-row">
                          <span className="stock-info">Stock: {prod.stock || 50} uds</span>
                          <button 
                            className="btn-trash-prod"
                            onClick={() => handleRemoveProduct(prod.id, prod.name)}
                            title="Quitar este producto de la vitrina del Stand"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-vitrina-box">
                  <Package size={48} className="empty-icon" />
                  <h4>No tienes productos en tu vitrina de feria</h4>
                  <p>¡Tus clientes visitarán tu puesto pero el mostrador está vacío! Haz clic en el botón para colocar productos.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus size={16} /> Colocar Mi Primer Producto
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Agregar Producto al Stand */}
        {showAddModal && (
          <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
            <div className="modal-content stand-modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="flex-row-gap">
                  <Store size={22} className="modal-icon-title" />
                  <h3>Colocar Producto en Vitrina de Stand</h3>
                </div>
                <button 
                  type="button" 
                  className="modal-close-btn" 
                  onClick={() => setShowAddModal(false)}
                  title="Cerrar"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Selector de origen */}
              <div className="source-toggle-tabs">
                <button 
                  className={`tab-btn ${prodSource === 'inventory' ? 'active' : ''}`}
                  onClick={() => setProdSource('inventory')}
                >
                  <Package size={16} /> Seleccionar de mi Almacén ({inventoryProducts.length})
                </button>
                <button 
                  className={`tab-btn ${prodSource === 'custom' ? 'active' : ''}`}
                  onClick={() => { setProdSource('custom'); setSelectedInvId(''); }}
                >
                  <Plus size={16} /> Nuevo Producto Especial de Feria
                </button>
              </div>

              <form onSubmit={handleAddProductToStand} className="standard-form modal-form">
                {prodSource === 'inventory' && (
                  <div className="form-group">
                    <label>Selecciona un Producto existente en Almacén:</label>
                    <select 
                      value={selectedInvId}
                      onChange={(e) => handleSelectInventoryProduct(e.target.value)}
                      className="select-custom"
                    >
                      <option value="">-- Elige un producto para autocompletar --</option>
                      {inventoryProducts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ${Number(p.price).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Nombre del Producto en la Vitrina</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Bolso de Lino Edición Especial"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Descripción / Detalles para la Feria</label>
                  <textarea 
                    rows={2}
                    placeholder="Materiales, detalles de origen o características especiales..."
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    className="textarea-custom"
                  />
                </div>

                <div className="two-col-grid">
                  <div className="form-group">
                    <label>Precio en Stand ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Stock Disponible</label>
                    <input 
                      type="number" 
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                {/* Subida de Fotografía */}
                <div className="form-group">
                  <label>Fotografía del Producto</label>
                  <div className="photo-upload-container">
                    <div className="upload-btn-row">
                      <label className="btn btn-secondary btn-file-pick">
                        <Upload size={15} />
                        {uploadingProdImg ? 'Subiendo...' : 'Subir foto'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleProdImageUpload} 
                          style={{ display: 'none' }}
                          disabled={uploadingProdImg}
                        />
                      </label>
                      <span className="text-divider">o URL:</span>
                    </div>
                    <input 
                      type="url" 
                      placeholder="https://ejemplo.com/foto.jpg"
                      value={newProdImageUrl}
                      onChange={(e) => setNewProdImageUrl(e.target.value)}
                    />
                    {newProdImageUrl && (
                      <div className="image-preview-card mini-preview">
                        <img src={newProdImageUrl} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
                        <span className="preview-status">✓ Foto vinculada</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-actions-row">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Plus size={16} /> Colocar en la Vitrina
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
