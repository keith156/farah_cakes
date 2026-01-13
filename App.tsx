
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

  // Fetch data from Supabase on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        console.warn("Supabase not configured. Using default sample data.");
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
    setIsCartOpen(true);
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

  const handleSpecialRequest = () => {
    const message = encodeURIComponent("Hello Farah Cakes! I'd like to inquire about a special custom cake request.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${message}`, '_blank');
  };

  const scrollToCatalogue = (e: React.MouseEvent) => {
    e.preventDefault();
    catalogueRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const displayCategories = ['All', ...categories];
  const filteredCakes = activeCategory === 'All' 
    ? cakes 
    : cakes.filter(c => c.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col selection:bg-rose-gold/20">
      <Navbar onCartClick={() => setIsCartOpen(true)} cartCount={cart.reduce((a, b) => a + b.quantity, 0)} />

      <main className="flex-grow pt-20">
        <section className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 bg-midnight">
            <img 
              src="https://images.unsplash.com/photo-1535141192574-5d4897c12636?q=80&w=2587&auto=format&fit=crop" 
              className="w-full h-full object-cover opacity-50 scale-100" 
              alt="Artisanal Cakes Background"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-midnight/40"></div>
          </div>

          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="animate-fade-up">
              <span className="text-rose-gold font-bold tracking-[0.4em] uppercase text-xs mb-6 block drop-shadow-lg">Handcrafted Excellence Est. 2020</span>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif leading-[1.05] mb-8 text-white drop-shadow-2xl">
                Artistry in <br/><span className="italic text-rose-gold">Every Bite</span>
              </h1>
              <p className="text-xl text-slate-200 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                Experience the luxury of handcrafted cakes that blend premium Ugandan ingredients with world-class baking techniques.
              </p>
              
              <div className="flex flex-row justify-center items-center gap-4 md:gap-6">
                <button 
                  onClick={scrollToCatalogue}
                  className="bg-rose-gold hover:bg-rose-gold-dark text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-bold uppercase tracking-widest text-[10px] md:text-xs transition duration-300 shadow-2xl shrink-0"
                >
                  View Collection
                </button>
                <button 
                  onClick={handleSpecialRequest}
                  className="border-2 border-white/30 text-white hover:bg-white hover:text-midnight px-8 md:px-12 py-4 md:py-5 rounded-full font-bold uppercase tracking-widest text-[10px] md:text-xs transition duration-300 bg-white/10 backdrop-blur-md shrink-0"
                >
                  Special Request
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={scrollToCatalogue}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
          >
            <i className="fa-solid fa-chevron-down text-white text-2xl"></i>
          </button>
        </section>

        <section 
          id="catalogue" 
          ref={catalogueRef}
          className="max-w-7xl mx-auto px-6 py-24 relative scroll-mt-20"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-serif text-midnight mb-6">Our Seasonal Collection</h2>
              <p className="text-slate-500">Each piece is baked fresh daily using the finest organic dairy and Belgian chocolates.</p>
            </div>
            
            <div className="w-full md:w-auto overflow-hidden">
                <div className="flex flex-nowrap gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                {displayCategories.map(cat => (
                    <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition duration-300 whitespace-nowrap shrink-0 ${
                        activeCategory === cat 
                        ? 'bg-rose-gold text-white shadow-lg shadow-rose-gold/20' 
                        : 'bg-white text-slate-400 border border-slate-100 hover:border-rose-gold hover:text-rose-gold'
                    }`}
                    >
                    {cat}
                    </button>
                ))}
                </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
               <div className="w-12 h-12 border-4 border-rose-gold border-t-transparent rounded-full animate-spin mb-4"></div>
               <p className="text-slate-400 font-serif italic">Setting the table...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
              {filteredCakes.map((cake, idx) => (
                <div key={cake.id} className="animate-fade-up" style={{ animationDelay: `${0.1 * idx}s` }}>
                  <CakeCard 
                    cake={cake} 
                    onAddToCart={addToCart} 
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

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
