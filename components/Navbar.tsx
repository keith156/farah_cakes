
import React, { useState, useEffect } from 'react';

interface NavbarProps {
  onCartClick: () => void;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ onCartClick, cartCount }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 flex justify-center py-4 px-6`}>
      <div className={`max-w-7xl w-full flex items-center justify-between transition-all duration-500 px-6 py-3 rounded-2xl ${
        isScrolled ? 'glass shadow-xl shadow-black/5 py-4' : 'bg-transparent'
      }`}>
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-midnight rounded-full flex items-center justify-center text-white transition-transform group-hover:rotate-[360deg] duration-700">
            <span className="font-serif font-bold italic">F</span>
          </div>
          <span className="text-xl font-serif text-midnight font-medium tracking-tight">Farah Cakes</span>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 uppercase tracking-widest">
            <a href="#catalogue" className="hover:text-rose-gold transition">Shop</a>
            <a href="#" className="hover:text-rose-gold transition">Our Story</a>
          </div>
          
          <button 
            onClick={onCartClick}
            className="group relative flex items-center gap-2 bg-midnight text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition shadow-lg shadow-midnight/20"
          >
            <i className="fa-solid fa-cart-shopping text-sm transition-transform group-hover:-translate-y-1"></i>
            <span className="text-xs font-bold uppercase tracking-widest">{cartCount} Items</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-gold w-3 h-3 rounded-full animate-ping"></span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
