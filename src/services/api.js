const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://pgp-dare-trader-instrumentation.trycloudflare.com'
    : 'http://localhost:8080');

export const api = {
  // Identity / Auth
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/api/identity/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error en inicio de sesión');
    return data;
  },

  register: async (email, password, role) => {
    const res = await fetch(`${API_URL}/api/identity/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al registrar usuario');
    return data;
  },

  // Module Management (Bounded Contexts)
  getModules: async (token) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/api/admin/modules`, { headers });
    if (!res.ok) throw new Error('Error al cargar módulos');
    return res.json();
  },

  toggleModule: async (moduleId, token) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/api/admin/modules/${moduleId}/toggle`, {
      method: 'PATCH',
      headers
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al alternar estado del módulo');
    return data;
  },

  // Inventory
  getCategories: async () => {
    const res = await fetch(`${API_URL}/api/inventory/categories`);
    if (!res.ok) throw new Error('Error al cargar categorías de inventario');
    return res.json();
  },

  createCategory: async (name, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/api/inventory/categories`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al crear categoría');
    return data;
  },

  deleteCategory: async (id, token) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/api/inventory/categories/${id}`, {
      method: 'DELETE',
      headers
    });
    if (!res.ok) {
      let msg = 'Error al eliminar categoría';
      try {
        const data = await res.json();
        if (data.message) msg = data.message;
      } catch (e) {}
      throw new Error(msg);
    }
    return true;
  },

  getProducts: async () => {
    const res = await fetch(`${API_URL}/api/inventory/products`);
    if (!res.ok) throw new Error('Error al cargar productos de inventario');
    return res.json();
  },

  createProduct: async (productData) => {
    const res = await fetch(`${API_URL}/api/inventory/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al crear producto');
    return data;
  },

  deleteProduct: async (id) => {
    const res = await fetch(`${API_URL}/api/inventory/products/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      let msg = 'Error al eliminar producto';
      try {
        const data = await res.json();
        if (data.message) msg = data.message;
      } catch (e) {}
      throw new Error(msg);
    }
    return true;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al subir la imagen');
    return data;
  },

  // Ecommerce (Synced via Domain Events)
  getEcommerceCategories: async () => {
    const res = await fetch(`${API_URL}/api/ecommerce/categories`);
    if (!res.ok) throw new Error('Módulo Ecommerce inactivo o error al cargar');
    return res.json();
  },

  getEcommerceProducts: async () => {
    const res = await fetch(`${API_URL}/api/ecommerce/products`);
    if (!res.ok) throw new Error('Módulo Ecommerce inactivo o error al cargar');
    return res.json();
  },

  // Fair (Synced via Domain Events)
  getFairProducts: async () => {
    const res = await fetch(`${API_URL}/api/fair/products`);
    if (!res.ok) throw new Error('Módulo Fair inactivo o error al cargar');
    return res.json();
  },

  getFairStands: async () => {
    const res = await fetch(`${API_URL}/api/fair/stands`);
    if (!res.ok) throw new Error('Módulo Fair inactivo o error al cargar puestos de la feria');
    return res.json();
  },

  getMyStand: async (email) => {
    const res = await fetch(`${API_URL}/api/fair/stands/my-stand?email=${encodeURIComponent(email)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Error al consultar el stand');
    return res.json();
  },

  createStand: async (standData) => {
    const res = await fetch(`${API_URL}/api/fair/stands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(standData)
    });
    if (!res.ok) throw new Error('Error al inaugurar el stand');
    return res.json();
  },

  updateStand: async (id, standData) => {
    const res = await fetch(`${API_URL}/api/fair/stands/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(standData)
    });
    if (!res.ok) throw new Error('Error al actualizar datos del stand');
    return res.json();
  },

  addStandProduct: async (standId, productData) => {
    const res = await fetch(`${API_URL}/api/fair/stands/${standId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error('Error al añadir producto a la vitrina del stand');
    return res.json();
  },

  removeStandProduct: async (standId, productId) => {
    const res = await fetch(`${API_URL}/api/fair/stands/${standId}/products/${productId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error al retirar producto de la vitrina');
    return true;
  },

  // Billing (Facturación & Checkout)
  processCheckout: async (checkoutData) => {
    const res = await fetch(`${API_URL}/api/billing/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutData)
    });
    if (!res.ok) {
      let err = 'Error al procesar el pago y facturación';
      try {
        const text = await res.text();
        if (text) err = text;
      } catch (e) {}
      throw new Error(err);
    }
    return res.json();
  },

  getInvoices: async () => {
    const res = await fetch(`${API_URL}/api/billing/invoices`);
    if (!res.ok) throw new Error('Módulo Billing inactivo o error al cargar facturas');
    return res.json();
  },

  getInvoiceById: async (id) => {
    const res = await fetch(`${API_URL}/api/billing/invoices/${id}`);
    if (!res.ok) throw new Error('Factura no encontrada');
    return res.json();
  }
};

export default api;
