import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import StorePage from './pages/StorePage';
import LoginPage from './pages/LoginPage';
import InventoryPage from './pages/InventoryPage';
import AdminPage from './pages/AdminPage';
import FairPage from './pages/FairPage';
import MyStandPage from './pages/MyStandPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta Principal: Ecommerce / Tienda Online */}
          <Route path="/" element={<StorePage />} />

          {/* Ruta de Acceso / Login dedicado */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas de Gestión */}
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/my-stand" element={<MyStandPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/fair" element={<FairPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
