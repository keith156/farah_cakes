
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
      <div className="absolute inset-0 bg-midnight/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md transform transition ease-in-out duration-500 sm:duration-700 bg-white shadow-2xl flex flex-col">
          <div className="p-8 border-b flex items-center justify-between">
            <h2 className="text-3xl font-serif text-midnight">Shopping Bag</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-midnight transition">
              <i className="fa-solid fa-times text-xl"></i>
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-8">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <i className="fa-solid fa-bag-shopping text-3xl text-slate-200"></i>
                </div>
                <h3 className="text-xl font-serif text-midnight mb-2">Your bag is empty</h3>
                <p className="text-slate-400 mb-8 max-w-[200px]">Find your next favorite treat in our collection.</p>
                <button onClick={onClose} className="text-rose-gold font-bold uppercase tracking-widest text-xs hover:text-midnight transition">
                  Go Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-6 group">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                      <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-serif text-lg text-midnight">{item.name}</h4>
                        <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-red-400 transition opacity-0 group-hover:opacity-100">
                          <i className="fa-solid fa-trash-can text-sm"></i>
                        </button>
                      </div>
                      <p className="text-slate-400 text-sm font-medium mb-4">
                        {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(item.price)}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 bg-slate-50 px-3 py-1 rounded-full">
                          <button onClick={() => onUpdateQty(item.id, -1)} className="text-slate-400 hover:text-midnight font-bold">-</button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => onUpdateQty(item.id, 1)} className="text-slate-400 hover:text-midnight font-bold">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-8 bg-slate-50 space-y-6">
               <div className="flex gap-3">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="COUPON CODE"
                  className="flex-grow bg-white border border-slate-100 rounded-xl px-5 py-3 text-xs tracking-[0.2em] uppercase focus:ring-1 focus:ring-rose-gold outline-none shadow-sm"
                />
                <button 
                  onClick={handleApplyCoupon}
                  className="bg-midnight text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition"
                >
                  Apply
                </button>
              </div>
              {error && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest px-2">{error}</p>}

              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex justify-between text-slate-500 text-sm">
                  <span className="uppercase tracking-[0.1em]">Subtotal</span>
                  <span className="font-medium">{new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-rose-gold text-sm font-bold">
                    <span className="uppercase tracking-[0.1em]">Discount ({appliedCoupon.code})</span>
                    <span>-{new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl font-serif text-midnight pt-2">
                  <span>Grand Total</span>
                  <span>{new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(total)}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full bg-rose-gold hover:bg-rose-gold-dark text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-sm transition shadow-xl shadow-rose-gold/20 flex items-center justify-center gap-3"
              >
                <i className="fa-brands fa-whatsapp text-lg"></i>
                Place Order on WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
