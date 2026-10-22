import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Store, 
  Sparkles, 
  Package, 
  Shield, 
  LogIn, 
  LogOut, 
  User as UserIcon,
  ShoppingBag
} from 'lucide-react';

export default function Navbar({ cartCount = 0, onOpenCart }) {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="main-navbar">
      <div className="nav-container">
        {/* Logo / Brand */}
        <Link to="/" className="nav-brand">
          <div className="logo-badge">V</div>
          <div className="brand-text">
            <span className="brand-title">VAZZAR</span>
            <span className="brand-sub">PLATAFORMA MODULAR</span>
          </div>
        </Link>

        {/* Links de Navegación */}
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <Store size={16} /> Tienda
          </Link>

          <Link to="/fair" className={`nav-link ${isActive('/fair') ? 'active' : ''}`}>
            <Sparkles size={16} /> Feria Virtual
          </Link>

          {user && (user.role === 'seller' || user.role === 'admin') && (
            <>
              <Link to="/inventory" className={`nav-link ${isActive('/inventory') ? 'active' : ''}`}>
                <Package size={16} /> Inventario
              </Link>
              <Link to="/my-stand" className={`nav-link ${isActive('/my-stand') ? 'active' : ''}`}>
                <Sparkles size={16} /> Mi Stand
              </Link>
            </>
          )}

          {user && user.role === 'admin' && (
            <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
              <Shield size={16} /> Módulos
            </Link>
          )}
        </div>

        {/* Lado derecho: Carrito & Sesión */}
        <div className="nav-actions">
          {/* Botón Carrito si estamos en la tienda */}
          {onOpenCart && (
            <button className="btn-nav-cart" onClick={onOpenCart} title="Ver Carrito">
              <ShoppingBag size={18} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          )}

          {user ? (
            <div className="nav-user-profile">
              <span className={`role-pill role-${user.role}`}>
                {user.role.toUpperCase()}
              </span>
              <span className="user-email-text" title={user.email}>
                {user.email}
              </span>
              <button 
                onClick={handleLogout} 
                className="btn-logout-icon" 
                title="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-nav-login">
              <LogIn size={16} />
              <span>Acceder</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
