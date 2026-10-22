import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shield, Layers, RefreshCw, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const notify = (msg, isError = false) => {
    setNotification({ msg, isError });
    setTimeout(() => setNotification(null), 3800);
  };

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setLoading(true);
    try {
      const data = await api.getModules(user?.token);
      setModules(data || []);
    } catch (e) {
      notify('Error cargando módulos: ' + e.message, true);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (moduleId) => {
    if (user?.role !== 'admin') {
      notify('Acceso denegado: Se requiere rol de Administrador.', true);
      return;
    }
    try {
      const res = await api.toggleModule(moduleId, user?.token);
      notify(res.message);
      await loadModules();
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

        <div className="section-title-bar">
          <div>
            <h2>🛡️ Control de Módulos (Arquitectura Hexagonal)</h2>
            <p className="section-subtitle">
              Enciende o apaga Bounded Contexts en tiempo real. Los interceptores del backend retornarán HTTP 503 cuando un módulo esté inactivo.
            </p>
          </div>
          <button className="btn btn-secondary" onClick={loadModules}>
            <RefreshCw size={15} /> Actualizar
          </button>
        </div>

        <div className="modules-grid-container">
          {modules.map((m) => (
            <div key={m.id} className={`solid-module-card ${m.enabled ? 'card-enabled' : 'card-disabled'}`}>
              <div className="module-card-top">
                <div className="module-info-main">
                  <h3>{m.name}</h3>
                  <code className="module-code">bounded-context: {m.id}</code>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={m.enabled} 
                    onChange={() => toggleModule(m.id)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <p className="module-desc">{m.description}</p>

              <div className="module-status-footer">
                <span className={`status-pill ${m.enabled ? 'pill-active' : 'pill-inactive'}`}>
                  {m.enabled ? '● ACTIVO (HTTP 200)' : '○ APAGADO (HTTP 503)'}
                </span>
                <span className="module-date">
                  Cambio: {new Date(m.lastToggledAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
