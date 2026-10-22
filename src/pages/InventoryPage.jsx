import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Plus, 
  Trash2, 
  Lock, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

export default function InventoryPage() {
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [notification, setNotification] = useState(null);

  // Form Categoría
  const [newCatName, setNewCatName] = useState('');

  // Form Producto
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState(29.99);
  const [prodStock, setProdStock] = useState(50);
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);

  const notify = (msg, isError = false) => {
    setNotification({ msg, isError });
    setTimeout(() => setNotification(null), 3800);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cats, prods] = await Promise.all([
        api.getCategories(),
        api.getProducts()
      ]);
      setCategories(cats || []);
      setProducts(prods || []);
    } catch (e) {
      notify('Error cargando inventario: ' + e.message, true);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const created = await api.createCategory(newCatName, user?.token);
      notify(`Categoría '${created.name}' guardada en Inventory y replicada a Ecommerce.`);
      setNewCatName('');
      await loadData();
    } catch (e) {
      notify(e.message, true);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar la categoría '${name}'? Se removerá tanto de Inventory como de Ecommerce.`)) {
      return;
    }
    try {
      await api.deleteCategory(id, user?.token);
      notify(`Categoría '${name}' eliminada correctamente de Inventory y Ecommerce.`);
      await loadData();
    } catch (e) {
      notify(e.message, true);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto '${name}'? Se removerá del inventario y del catálogo de la tienda.`)) {
      return;
    }
    try {
      await api.deleteProduct(id);
      notify(`Producto '${name}' eliminado con éxito del sistema.`);
      await loadData();
    } catch (e) {
      notify(e.message, true);
    }
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImg(true);
      const res = await api.uploadImage(file);
      setProdImageUrl(res.url);
      notify('¡Fotografía subida al servidor con éxito!');
    } catch (err) {
      notify('Error al subir imagen: ' + err.message, true);
    } finally {
      setUploadingImg(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!prodName.trim()) return;
    try {
      await api.createProduct({
        name: prodName,
        description: prodDesc,
        price: prodPrice,
        stock: prodStock,
        fairEligible: false,
        categoryId: prodCategoryId || null,
        imageUrl: prodImageUrl.trim() || null
      });
      notify(`Producto '${prodName}' publicado con éxito con su foto y categoría.`);
      setProdName('');
      setProdDesc('');
      setProdCategoryId('');
      setProdImageUrl('');
      await loadData();
    } catch (e) {
      notify(e.message, true);
    }
  };

  const currentUserId = user?.userId || user?.id;
  const isAdmin = user?.role === 'admin';

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

        {/* Banner de la sección */}
        <div className="section-title-bar">
          <div>
            <h2>📦 Gestión de Inventario</h2>
            <p className="section-subtitle">
              Administra tus categorías y da de alta productos con fotografías reales.
            </p>
          </div>
          <div className="active-user-badge">
            <span>Conectado como:</span>
            <strong>{user?.email || 'Vendedor'}</strong>
          </div>
        </div>

        {/* Rejilla de Formularios */}
        <div className="dual-form-grid">
          {/* Tarjeta de Categorías */}
          <div className="solid-card">
            <div className="card-header-styled">
              <Layers size={18} />
              <h3>Categorías de Productos</h3>
            </div>

            <form onSubmit={handleCreateCategory} className="standard-form">
              <div className="form-group">
                <label>Nombre de la Categoría</label>
                <input 
                  type="text" 
                  placeholder="Ej. Joyería Fina, Postres, etc."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Plus size={16} /> Crear Categoría
              </button>
            </form>

            <h4 className="card-subheading">Categorías registradas en el sistema:</h4>
            <ul className="categories-list">
              {categories.length === 0 ? (
                <li className="empty-state">No hay categorías registradas</li>
              ) : (
                categories.map((c) => {
                  const isCreator = Boolean(currentUserId && c.createdBy && c.createdBy === currentUserId);
                  const canDelete = isCreator || isAdmin;

                  return (
                    <li key={c.id} className="category-item-row">
                      <div className="cat-meta-wrap">
                        <div className="cat-title-line">
                          <strong className="cat-title">{c.name}</strong>
                          {isCreator && <span className="badge-tag badge-own">Tuya</span>}
                          {!isCreator && c.createdBy && <span className="badge-tag badge-other">Otro Vendedor</span>}
                          {!c.createdBy && <span className="badge-tag badge-global">Global</span>}
                        </div>

                        <div className="cat-details-line">
                          <span>👤 Creador: <strong>{c.creatorEmail ? c.creatorEmail : 'Catálogo General (Sistema)'}</strong></span>
                        </div>
                      </div>

                      {canDelete ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(c.id, c.name)}
                          className="btn-danger-sm"
                          title={`Eliminar categoría ${c.name}`}
                        >
                          <Trash2 size={13} /> Eliminar
                        </button>
                      ) : (
                        <span className="locked-tag" title="Solo el creador puede eliminarla">
                          <Lock size={12} /> Bloqueada
                        </span>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          {/* Tarjeta de Publicación de Productos */}
          <div className="solid-card">
            <div className="card-header-styled">
              <Package size={18} />
              <h3>Publicar Nuevo Producto</h3>
            </div>

            <form onSubmit={handleCreateProduct} className="standard-form">
              <div className="form-group">
                <label>Nombre del Producto</label>
                <input 
                  type="text" 
                  placeholder="Ej. Zapatillas Urbanas Pro"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <input 
                  type="text" 
                  placeholder="Materiales, detalles de fabricación..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                />
              </div>

              {/* Selector de Categoría */}
              <div className="form-group">
                <label>Categoría</label>
                <select 
                  value={prodCategoryId}
                  onChange={(e) => setProdCategoryId(e.target.value)}
                  className="select-custom"
                  required
                >
                  <option value="">-- Selecciona una categoría --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.creatorEmail ? `(Creado por: ${c.creatorEmail})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subida de Fotografía */}
              <div className="form-group">
                <label>Fotografía del Producto</label>
                <div className="photo-upload-container">
                  <div className="upload-btn-row">
                    <label className="btn btn-secondary btn-file-pick">
                      <Upload size={15} />
                      {uploadingImg ? 'Subiendo fotografía...' : 'Subir foto desde mi PC'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageFileChange} 
                        style={{ display: 'none' }}
                        disabled={uploadingImg}
                      />
                    </label>
                    <span className="text-divider">o ingresa una URL:</span>
                  </div>

                  <input 
                    type="url" 
                    placeholder="https://ejemplo.com/foto.jpg"
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                  />

                  {prodImageUrl && (
                    <div className="image-preview-card">
                      <img 
                        src={prodImageUrl} 
                        alt="Vista previa" 
                        className="preview-thumbnail"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <div className="preview-info">
                        <span className="preview-status">✓ Foto vinculada</span>
                        <span className="preview-url">{prodImageUrl}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Precio y Stock en 2 columnas */}
              <div className="two-col-grid">
                <div className="form-group">
                  <label>Precio ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(parseFloat(e.target.value))}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Stock Físico</label>
                  <input 
                    type="number" 
                    value={prodStock}
                    onChange={(e) => setProdStock(parseInt(e.target.value))}
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-submit-prod">
                <Plus size={16} /> Publicar en Inventario y Tienda
              </button>
            </form>

            <h4 className="card-subheading">Tus productos en almacén:</h4>
            <ul className="products-inventory-list">
              {products.length === 0 ? (
                <li className="empty-state">No hay productos en inventario</li>
              ) : (
                products.map((p) => (
                  <li key={p.id} className="prod-inventory-item">
                    <div className="prod-inv-left">
                      <strong>{p.name}</strong>
                      <span className="stock-info">Stock: {p.stock} uds.</span>
                      {p.fairEligible && <span className="badge-tag badge-fair">FERIA</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <code className="item-id-tag">ID: {p.id.substring(0, 8)}...</code>
                      <button 
                        type="button" 
                        onClick={() => handleDeleteProduct(p.id, p.name)} 
                        className="btn-danger-sm"
                        title={`Eliminar producto ${p.name}`}
                      >
                        <Trash2 size={13} /> Eliminar
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
