import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Receipt, 
  ShieldCheck, 
  CheckCircle, 
  Printer, 
  ArrowRight, 
  Lock, 
  Building2, 
  Truck, 
  AlertCircle, 
  X,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems = [], 
  cartTotal = 0, 
  onSuccess,
  sourceChannel = 'ecommerce'
}) {
  const { user } = useAuth();

  const [step, setStep] = useState('form'); // 'form' | 'processing' | 'invoice'
  const [errorMsg, setErrorMsg] = useState(null);
  const [issuedInvoice, setIssuedInvoice] = useState(null);

  // Billing Form Fields
  const [customerName, setCustomerName] = useState(user?.email ? user.email.split('@')[0] : 'Cliente Vazzar');
  const [taxId, setTaxId] = useState('CF - Consumidor Final');
  const [email, setEmail] = useState(user?.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState('Calle Principal #123, San Salvador');
  
  // Payment Form Fields
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8842');
  const [cardHolder, setCardHolder] = useState(user?.email ? user.email.split('@')[0].toUpperCase() : 'CLIENTE VAZZAR');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('789');

  useEffect(() => {
    if (user?.email) {
      if (!customerName || customerName === 'Cliente Vazzar') {
        setCustomerName(user.email.split('@')[0]);
      }
      if (!email) {
        setEmail(user.email);
      }
      setCardHolder(user.email.split('@')[0].toUpperCase());
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = async (e) => {
    e.preventDefault();
    if (!cartItems || cartItems.length === 0) {
      setErrorMsg('No hay productos en el pedido para facturar.');
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('Por favor indica el nombre o razón social para la factura');
      return;
    }

    try {
      setErrorMsg(null);
      setStep('processing');

      const payload = {
        userId: user?.userId || user?.id || null,
        customerName: customerName.trim(),
        customerEmail: email.trim() || undefined,
        taxId: taxId.trim(),
        sourceChannel,
        paymentMethod: paymentMethod === 'credit_card' 
          ? 'Tarjeta de Crédito / Débito' 
          : paymentMethod === 'transfer' 
            ? 'Transferencia Bancaria' 
            : 'Pago Contra Entrega',
        cardNumberLast4: paymentMethod === 'credit_card' ? cardNumber.slice(-4) : null,
        deliveryAddress: deliveryAddress.trim(),
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.qty || 1,
          unitPrice: item.price
        }))
      };

      // Simular breve latencia de seguridad bancaria
      await new Promise(r => setTimeout(r, 900));

      // Llamada real al Bounded Context BILLING
      const invoice = await api.processCheckout(payload);
      setIssuedInvoice(invoice);
      setStep('invoice');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error procesando el pago');
      setStep('form');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={step === 'invoice' ? onClose : undefined}>
      <div className="checkout-modal-container solid-card" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera */}
        <div className="modal-header">
          <div className="flex-row-gap">
            <Receipt size={22} className="modal-icon-title" />
            <div>
              <h3>{step === 'invoice' ? 'Factura Electrónica Emitida' : 'Pasarela de Pago & Facturación'}</h3>
              <span className="modal-sub">Bounded Context: BILLING</span>
            </div>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose} 
            title="Cerrar ventana de pago"
            aria-label="Cerrar ventana"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {errorMsg && (
          <div className="notification-toast error inline-error">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* PASO 1 Y 2: FORMULARIO DE PAGO */}
        {step === 'form' && (
          <form onSubmit={handlePay} className="checkout-form-grid">
            <div className="checkout-left-col">
              <h4 className="section-step-title">
                <FileText size={16} /> 1. Datos para Facturación Fiscal (Billing)
              </h4>

              <div className="form-group">
                <label>Nombre Completo / Razón Social</label>
                <input 
                  type="text" 
                  placeholder="Ej. Harold Orellana"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required 
                />
              </div>

              <div className="two-col-grid">
                <div className="form-group">
                  <label>Documento Fiscal (NIT / DUI)</label>
                  <input 
                    type="text" 
                    placeholder="0614-120590-101-2"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <input 
                    type="email" 
                    placeholder="cliente@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dirección de Entrega</label>
                <input 
                  type="text" 
                  placeholder="Avenida Los Próceres #402, San Salvador"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              </div>

              {/* Selector de Método de Pago */}
              <h4 className="section-step-title mt-4">
                <CreditCard size={16} /> 2. Método de Pago Seguro
              </h4>

              <div className="payment-methods-tabs">
                <button
                  type="button"
                  className={`pm-tab ${paymentMethod === 'credit_card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('credit_card')}
                >
                  <CreditCard size={16} /> Tarjeta
                </button>
                <button
                  type="button"
                  className={`pm-tab ${paymentMethod === 'transfer' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('transfer')}
                >
                  <Building2 size={16} /> Transferencia
                </button>
                <button
                  type="button"
                  className={`pm-tab ${paymentMethod === 'cash' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <Truck size={16} /> Contra Entrega
                </button>
              </div>

              {paymentMethod === 'credit_card' && (
                <div className="card-payment-box">
                  <div className="virtual-card-preview">
                    <div className="vcard-chip"></div>
                    <div className="vcard-number">{cardNumber || '•••• •••• •••• ••••'}</div>
                    <div className="vcard-bottom">
                      <div>
                        <span className="vcard-lbl">TITULAR</span>
                        <div className="vcard-val">{cardHolder || 'TITULAR'}</div>
                      </div>
                      <div>
                        <span className="vcard-lbl">VENCE</span>
                        <div className="vcard-val">{cardExpiry || 'MM/AA'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group mt-3">
                    <label>Número de Tarjeta</label>
                    <input 
                      type="text" 
                      maxLength="19"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="two-col-grid">
                    <div className="form-group">
                      <label>Vencimiento (MM/AA)</label>
                      <input 
                        type="text" 
                        maxLength="5"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV / CVC</label>
                      <input 
                        type="password" 
                        maxLength="4"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'transfer' && (
                <div className="info-payment-box">
                  <Building2 size={24} color="#0284c7" />
                  <div>
                    <strong>Banco Agrícola / BAC Credomatic</strong>
                    <p>Cuenta Corriente: 021-99482-019 a nombre de Vazzar S.A. de C.V.</p>
                    <small>La factura se emitirá de inmediato con estado registrado.</small>
                  </div>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="info-payment-box">
                  <Truck size={24} color="#10b981" />
                  <div>
                    <strong>Pago en Efectivo al Entregar</strong>
                    <p>Cancela el total en efectivo al momento de recibir el pedido en tu dirección.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Columna Derecha: Resumen de Compra */}
            <div className="checkout-right-col">
              <div className="order-summary-box">
                <h4>Resumen del Pedido ({cartItems.length} items)</h4>

                <div className="checkout-items-list">
                  {cartItems.map(item => (
                    <div key={item.id} className="checkout-item-row">
                      <div className="checkout-item-name">
                        <strong>{item.name}</strong>
                        <span>Cant: {item.qty || 1} × ${Number(item.price).toFixed(2)}</span>
                      </div>
                      <span className="checkout-item-subtotal">
                        ${((item.qty || 1) * item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="breakdown-separator"></div>

                <div className="breakdown-row">
                  <span>Subtotal:</span>
                  <strong>${Number(cartTotal).toFixed(2)}</strong>
                </div>
                <div className="breakdown-row">
                  <span>IVA (13% incluido):</span>
                  <span>${(Number(cartTotal) * 0.13 / 1.13).toFixed(2)}</span>
                </div>
                <div className="breakdown-row total-highlight">
                  <span>Total a Facturar:</span>
                  <strong className="total-amount">${Number(cartTotal).toFixed(2)}</strong>
                </div>

                <div className="security-notice">
                  <Lock size={14} />
                  <span>Conexión cifrada directa al módulo de Billing.</span>
                </div>

                <button type="submit" className="btn btn-primary btn-pay-now">
                  <ShieldCheck size={18} /> Pagar ${Number(cartTotal).toFixed(2)}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* PASO: PROCESANDO PAGO */}
        {step === 'processing' && (
          <div className="checkout-processing-view">
            <div className="spinner-large"></div>
            <h3>Procesando Pago Seguro...</h3>
            <p>Conectando con la pasarela bancaria y registrando transacción en el módulo de Facturación (Billing)...</p>
          </div>
        )}

        {/* PASO: FACTURA OFICIAL EMITIDA */}
        {step === 'invoice' && issuedInvoice && (
          <div className="invoice-success-container">
            <div className="invoice-badge-status">
              <CheckCircle size={28} color="#10b981" />
              <div>
                <h4>¡Pago Aprobado y Factura Generada!</h4>
                <span>Transacción registrada con éxito en el esquema `billing` de PostgreSQL</span>
              </div>
            </div>

            {/* Recibo Fiscal Oficial */}
            <div className="official-invoice-sheet" id="printable-invoice">
              <div className="invoice-sheet-header">
                <div>
                  <div className="invoice-brand-row">
                    <span className="brand-logo-letter">V</span>
                    <strong className="invoice-brand-name">VAZZAR S.A. DE C.V.</strong>
                  </div>
                  <p className="invoice-legal-info">
                    NIT: 0614-290823-102-1 • NRC: 384729-1<br />
                    Resolución DGT No. 2026-FACT-00918<br />
                    San Salvador, El Salvador
                  </p>
                </div>
                <div className="invoice-number-box">
                  <span className="inv-doc-title">FACTURA ELECTRÓNICA</span>
                  <span className="inv-doc-number">{issuedInvoice.invoiceNumber}</span>
                  <span className="inv-status-pill">ESTADO: {issuedInvoice.status?.toUpperCase()}</span>
                </div>
              </div>

              <div className="invoice-meta-grid">
                <div>
                  <span className="meta-label">CLIENTE / FACTURADO A:</span>
                  <strong className="meta-val">{issuedInvoice.customerName}</strong>
                </div>
                <div>
                  <span className="meta-label">NIT / DUI:</span>
                  <strong className="meta-val">{issuedInvoice.taxId}</strong>
                </div>
                <div>
                  <span className="meta-label">FECHA DE EMISIÓN:</span>
                  <span className="meta-val">
                    {new Date(issuedInvoice.issuedAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="meta-label">MÉTODO DE PAGO:</span>
                  <span className="meta-val">{issuedInvoice.paymentMethod}</span>
                </div>
              </div>

              {/* Tabla de Artículos Facturados */}
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Cant.</th>
                    <th>Descripción del Producto</th>
                    <th className="text-right">Precio Unit.</th>
                    <th className="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedInvoice.items && issuedInvoice.items.map(item => (
                    <tr key={item.id}>
                      <td>{item.quantity}</td>
                      <td>{item.productName}</td>
                      <td className="text-right">${Number(item.unitPrice).toFixed(2)}</td>
                      <td className="text-right">${Number(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-right"><strong>TOTAL FACTURADO:</strong></td>
                    <td className="text-right total-cell">
                      <strong>${Number(issuedInvoice.total).toFixed(2)}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="invoice-digital-stamp">
                <ShieldCheck size={20} color="#10b981" />
                <span>
                  CERTIFICACIÓN DIGITAL BILLING: UUID {issuedInvoice.id} • Orden #{issuedInvoice.orderId?.slice(0, 8)}
                </span>
              </div>
            </div>

            <div className="invoice-actions-footer">
              <button className="btn btn-secondary" onClick={handlePrint}>
                <Printer size={16} /> Imprimir / Guardar Factura
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                Seguir Comprando <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
