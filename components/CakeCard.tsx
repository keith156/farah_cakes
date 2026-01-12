
import React from 'react';
import { Cake } from '../types';

interface CakeCardProps {
  cake: Cake;
  onAddToCart: (cake: Cake) => void;
}

const CakeCard: React.FC<CakeCardProps> = ({ cake, onAddToCart }) => {
  return (
    <div className="group relative flex flex-col h-full bg-white rounded-[2rem] p-3 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 overflow-hidden border border-slate-50">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
        <img 
          src={cake.imageUrl} 
          alt={cake.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="glass px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] text-midnight">
            {cake.category}
          </span>
        </div>
        
        {/* Subtle Gradient Overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-midnight/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
      
      <div className="px-3 pt-6 pb-2 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-serif text-midnight group-hover:text-rose-gold transition-colors pr-4 leading-tight">{cake.name}</h3>
          <span className="text-sm font-bold text-rose-gold whitespace-nowrap pt-1">
            {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(cake.price)}
          </span>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-6">
          {cake.description}
        </p>
        
        <div className="mt-auto">
          <button 
            onClick={(e) => { e.stopPropagation(); onAddToCart(cake); }}
            className="w-full bg-midnight hover:bg-rose-gold text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-lg shadow-midnight/10 hover:shadow-rose-gold/20 flex items-center justify-center gap-2 group/btn"
          >
            <i className="fa-solid fa-plus text-[10px] transition-transform group-hover/btn:rotate-90"></i>
            Add to Basket
          </button>
        </div>
      </div>
    </div>
  );
};

export default CakeCard;
