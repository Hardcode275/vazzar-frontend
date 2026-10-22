import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Shield, Lock, Mail, ArrowLeft, CheckCircle, AlertTriangle, UserPlus, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('seller');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        res = await api.register(email, password, role);
      } else {
        res = await api.login(email, password);
      }

      loginUser(res);

      // Redirección inteligente según el rol
      if (res.role === 'admin') {
        navigate('/admin');
      } else if (res.role === 'seller') {
        navigate('/inventory');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(userEmail, userPass);
      loginUser(res);
      if (res.role === 'admin') navigate('/admin');
      else if (res.role === 'seller') navigate('/inventory');
      else navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        {/* Volver a la tienda */}
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Volver a la Tienda
        </Link>

        {/* Encabezado del login */}
        <div className="login-header">
          <div className="logo-badge-login">V</div>
          <h2>{isRegister ? 'Crear Cuenta Vazzar' : 'Acceso a la Plataforma'}</h2>
          <p className="login-sub">
            {isRegister 
              ? 'Regístrate para vender tus productos o comprar'
              : 'Ingresa con tus credenciales de vendedor o administrador'}
          </p>
        </div>

        {/* Mensaje de error si falla */}
        {error && (
          <div className="alert-box alert-error">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Pestañas Iniciar Sesión / Registrarse */}
        <div className="auth-tabs">
          <button 
            type="button" 
            className={`auth-tab ${!isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(false); setError(null); }}
          >
            <LogIn size={15} /> Iniciar Sesión
          </button>
          <button 
            type="button" 
            className={`auth-tab ${isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(true); setError(null); }}
          >
            <UserPlus size={15} /> Registrarse
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label><Mail size={14} /> Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="ejemplo@vazzar.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label><Lock size={14} /> Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Rol de la Cuenta</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="select-custom"
              >
                <option value="seller">Vendedor (Gestiona Productos y Categorías)</option>
                <option value="buyer">Comprador (Cliente de la Tienda)</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-submit-auth" disabled={loading}>
            {loading ? 'Procesando...' : (isRegister ? 'Crear Cuenta' : 'Entrar al Sistema')}
          </button>
        </form>

        {/* Acceso Rápido de Prueba */}
        <div className="quick-access-section">
          <span className="quick-access-label">Credenciales de prueba:</span>
          <div className="quick-buttons-grid">
            <button 
              type="button" 
              onClick={() => quickLogin('harold_orellana@siman.com', 'admin123')}
              className="btn-quick-tag"
            >
              <strong>Harold (Siman)</strong>
              <small>harold_orellana@siman.com</small>
            </button>

            <button 
              type="button" 
              onClick={() => quickLogin('calzado@vazzar.com', 'seller123')}
              className="btn-quick-tag"
            >
              <strong>Maestros Calzado</strong>
              <small>calzado@vazzar.com</small>
            </button>

            <button 
              type="button" 
              onClick={() => quickLogin('cafegourmet@vazzar.com', 'seller123')}
              className="btn-quick-tag"
            >
              <strong>Finca El Roble</strong>
              <small>cafegourmet@vazzar.com</small>
            </button>

            <button 
              type="button" 
              onClick={() => quickLogin('moda@vazzar.com', 'seller123')}
              className="btn-quick-tag"
            >
              <strong>Taller Textil</strong>
              <small>moda@vazzar.com</small>
            </button>

            <button 
              type="button" 
              onClick={() => quickLogin('seller@vazzar.com', 'seller123')}
              className="btn-quick-tag"
            >
              <strong>Vendedor Genérico</strong>
              <small>seller@vazzar.com</small>
            </button>

            <button 
              type="button" 
              onClick={() => quickLogin('admin@vazzar.com', 'admin123')}
              className="btn-quick-tag"
            >
              <strong>Administrador</strong>
              <small>admin@vazzar.com</small>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
