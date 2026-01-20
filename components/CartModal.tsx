import React, { useState } from 'react';
import { CartItem, Coupon } from '../types';

interface CartModalProps {
  cart: CartItem[];
  coupons: Coupon[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  whatsappNumber: string;
}

const CartModal: React.FC<CartModalProps> = ({ cart, coupons, onClose, onRemove, onUpdateQty, whatsappNumber }) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [error, setError] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent / 100) : 0;
  const total = subtotal - discount;

  const handleApplyCoupon = () => {
    const found = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    if (found) {
      setAppliedCoupon(found);
      setError('');
    } else {
      setError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const handleCheckout = () => {
    const itemsText = cart.map(item => `- ${item.name} (x${item.quantity})`).join('\n');
    const totalText = new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(total);
    const message = encodeURIComponent(
      `Hello Farah Cakes! I'd like to place an order:\n\n${itemsText}\n\nSubtotal: ${new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(subtotal)}\nDiscount: ${appliedCoupon ? `${appliedCoupon.discountPercent}% (${appliedCoupon.code})` : 'None'}\n*TOTAL: ${totalText}*`
    );
    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-midnight/30 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md transform transition ease-in-out duration-500 sm:duration-700 bg-white flex flex-col shadow-4xl rounded-l-4xl">
          <div className="p-8 border-b flex items-center justify-between">
            <h2 className="text-2xl font-bold text-midnight font-serif">Checkout Order</h2>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-soft-bg flex items-center justify-center text-slate-400 hover:text-midnight transition">
              <i className="fa-solid fa-times text-lg"></i>
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-soft-bg rounded-3xl flex items-center justify-center mb-6">
                  <i className="fa-solid fa-cake-candles text-2xl text-slate-200"></i>
                </div>
                <h3 className="text-lg font-bold text-midnight mb-2">No treats here yet</h3>
                <p className="text-slate-400 text-sm mb-8 max-w-[200px]">Fill your bag with something delicious!</p>
                <button onClick={onClose} className="bg-primary-yellow text-midnight px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary-yellow/20">
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="bg-soft-bg p-4 rounded-3xl flex gap-4 group">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                      <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <h4 className="font-bold text-midnight text-sm truncate">{item.name}</h4>
                        <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-red-500 transition">
                          <i className="fa-solid fa-xmark text-sm"></i>
                        </button>
                      </div>
                      <p className="text-accent-emerald text-xs font-bold mb-3">
                        {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(item.price)}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-full border border-slate-100">
                          <button onClick={() => onUpdateQty(item.id, -1)} className="text-slate-400 hover:text-midnight font-bold px-1">-</button>
                          <span className="text-[10px] font-black w-4 text-center">{item.quantity}</span>
                          <button onClick={() => onUpdateQty(item.id, 1)} className="text-slate-400 hover:text-midnight font-bold px-1">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-8 bg-white border-t border-slate-50 space-y-6">
               <div className="flex gap-2">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="PROMO CODE"
                  className="flex-grow bg-soft-bg border border-slate-100 rounded-2xl px-5 py-3 text-[10px] tracking-[0.2em] uppercase font-bold focus:ring-1 focus:ring-accent-emerald outline-none"
                />
                <button 
                  onClick={handleApplyCoupon}
                  className="bg-midnight text-white px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition"
                >
                  Apply
                </button>
              </div>
              {error && <p className="text-red-500 text-[9px] uppercase font-bold tracking-widest px-2">{error}</p>}

              <div className="space-y-3">
                <div className="flex justify-between text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>{new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-accent-emerald text-xs font-bold uppercase tracking-widest">
                    <span>Promo ({appliedCoupon.code})</span>
                    <span>-{new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-midnight pt-2 border-t border-slate-50">
                  <span>Total</span>
                  <span className="text-accent-emerald">{new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(total)}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full bg-primary-yellow hover:bg-primary-yellow-dark text-midnight py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition shadow-xl shadow-primary-yellow/20 flex items-center justify-center gap-3 active:scale-95"
              >
                <i className="fa-brands fa-whatsapp text-lg"></i>
                Place WhatsApp Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;