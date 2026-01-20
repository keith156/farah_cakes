
import React, { useState, useEffect, useRef } from 'react';
import { Cake, CartItem, Coupon, AdminView } from './types';
import { INITIAL_CAKES, INITIAL_COUPONS, INITIAL_CATEGORIES, WHATSAPP_NUMBER } from './constants';
import { supabase } from './services/supabaseClient';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CakeCard from './components/CakeCard';
import AdminPanel from './components/AdminPanel';
import CartModal from './components/CartModal';

const App: React.FC = () => {
  const catalogueRef = useRef<HTMLElement>(null);

  const [cakes, setCakes] = useState<Cake[]>(INITIAL_CAKES);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      try {
        const [cakesRes, categoriesRes, couponsRes] = await Promise.all([
          supabase.from('cakes').select('*').order('created_at', { ascending: false }),
          supabase.from('categories').select('name'),
          supabase.from('coupons').select('*')
        ]);

        if (cakesRes.data && cakesRes.data.length > 0) {
          setCakes(cakesRes.data.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            price: Number(c.price),
            imageUrl: c.image_url,
            category: c.category_name
          })));
        }

        if (categoriesRes.data && categoriesRes.data.length > 0) {
          setCategories(categoriesRes.data.map(cat => cat.name));
        }

        if (couponsRes.data && couponsRes.data.length > 0) {
          setCoupons(couponsRes.data.map(c => ({
            code: c.code,
            discountPercent: c.discount_percent
          })));
        }
      } catch (error) {
        console.error("Error fetching live data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const addToCart = (cake: Cake) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === cake.id);
      if (existing) {
        return prev.map(item => 
          item.id === cake.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...cake, quantity: 1 }];
    });
    // Removed setIsCartOpen(true) to avoid confusing users with immediate sidebar popups
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const displayCategories = ['All', ...categories];
  
  const filteredCakes = cakes.filter(cake => {
    const matchesCategory = activeCategory === 'All' || cake.category === activeCategory;
    const matchesSearch = cake.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cake.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onCartClick={() => setIsCartOpen(true)} cartCount={cartCount} />

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="bg-white px-6 pt-12 pb-4">
          <div className="max-w-4xl mx-auto text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-midnight mb-2 font-serif">
              What are we baking today?
            </h1>
            <p className="text-slate-muted text-sm md:text-base font-medium mb-8">
              Order fresh artisanal cakes delivered to your doorstep.
            </p>
            
            {/* Search Input */}
            <div className="max-w-2xl mx-auto md:mx-0 relative group mb-8">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <i className="fa-solid fa-magnifying-glass text-slate-400 text-sm"></i>
              </div>
              <input 
                type="text"
                placeholder="Search for cakes, cupcakes or pastries..."
                className="w-full bg-[#f4f7f9] border border-transparent rounded-full pl-14 pr-6 py-4 text-sm focus:bg-white focus:border-slate-200 focus:shadow-sm outline-none transition-all placeholder:text-slate-400 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Category Bar - Now static as requested */}
        <section className="bg-white">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex overflow-x-auto gap-3 no-scrollbar pb-1">
              {displayCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                    activeCategory === cat 
                    ? 'bg-midnight text-white border-midnight shadow-md' 
                    : 'bg-white text-slate-400 border-[#eef2f5] hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Product List Section */}
        <section id="catalogue" className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-midnight font-serif">Featured Menu</h2>
            <span className="text-[10px] font-black text-accent-emerald uppercase tracking-[0.2em]">
              {filteredCakes.length} OPTIONS
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
               <div className="w-8 h-8 border-3 border-accent-emerald border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24 md:pb-12">
              {filteredCakes.map((cake, idx) => (
                <div key={cake.id} className="animate-fade-up" style={{ animationDelay: `${0.05 * idx}s` }}>
                  <CakeCard cake={cake} onAddToCart={addToCart} />
                </div>
              ))}
              
              {filteredCakes.length === 0 && (
                <div className="col-span-full text-center py-20 bg-white rounded-4xl border border-dashed border-slate-200">
                  <p className="text-slate-400 italic font-medium">No treats found matching your selection.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Floating Action Cart - Redesigned to match the screenshot provided */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md z-[50]">
            <button 
                onClick={() => setIsCartOpen(true)}
                className="w-full bg-[#FFB84C] hover:bg-[#ffa929] text-midnight py-4 rounded-2xl font-black shadow-[0_20px_50px_rgba(255,184,76,0.3)] flex items-center justify-between px-6 transition-all active:scale-95 border-b-4 border-[#e6a13c] group"
            >
                <div className="flex items-center gap-4">
                    <span className="bg-midnight text-white w-7 h-7 rounded-full text-[11px] flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                        {cartCount}
                    </span>
                    <span className="uppercase text-[11px] tracking-[0.2em] font-black">View Bag</span>
                </div>
                <span className="font-black text-sm">
                    UGX {cartTotal.toLocaleString()}
                </span>
            </button>
        </div>
      )}

      <Footer onStaffClick={() => setIsAdminOpen(true)} />

      {isCartOpen && (
        <CartModal 
          cart={cart} 
          coupons={coupons}
          onClose={() => setIsCartOpen(false)} 
          onRemove={removeFromCart}
          onUpdateQty={updateQuantity}
          whatsappNumber={WHATSAPP_NUMBER}
        />
      )}

      {isAdminOpen && (
        <AdminPanel 
          cakes={cakes}
          setCakes={setCakes}
          coupons={coupons}
          setCoupons={setCoupons}
          categories={categories}
          setCategories={setCategories}
          onClose={() => setIsAdminOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
