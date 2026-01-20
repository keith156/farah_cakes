
import React, { useState, useEffect } from 'react';
import { Cake, Coupon, AdminView } from '../types';
import { supabase } from '../services/supabaseClient';
import { generateDescription } from '../services/geminiService';

interface AdminPanelProps {
  cakes: Cake[];
  setCakes: React.Dispatch<React.SetStateAction<Cake[]>>;
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ cakes, setCakes, coupons, setCoupons, categories, setCategories, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [activeView, setActiveView] = useState<AdminView>(AdminView.CAKES);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formCake, setFormCake] = useState<Partial<Cake>>({ category: categories[0] || 'Birthday' });
  
  const [newCoupon, setNewCoupon] = useState({ code: '', discountPercent: 10 });
  const [newCategory, setNewCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    if (!formCake.category && categories.length > 0) {
      setFormCake(prev => ({ ...prev, category: categories[0] }));
    }
  }, [categories]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'farah' && password === 'sweet tooth') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect credentials');
    }
  };

  const handleSaveCake = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const cakeData = {
        name: formCake.name || 'Unnamed Cake',
        description: formCake.description || 'No description.',
        price: Number(formCake.price) || 0,
        image_url: formCake.imageUrl || 'https://picsum.photos/800/600',
        category_name: formCake.category || categories[0] || 'Birthday'
      };

      if (isEditing) {
        const { error } = await supabase.from('cakes').update(cakeData).eq('id', isEditing);
        if (error) throw error;
        setCakes(prev => prev.map(c => c.id === isEditing ? { ...c, ...cakeData, imageUrl: cakeData.image_url, category: cakeData.category_name } : c));
      } else {
        const { data, error } = await supabase.from('cakes').insert([cakeData]).select();
        if (error) throw error;
        if (data && data[0]) {
            const newCake: Cake = {
                id: data[0].id,
                name: data[0].name,
                description: data[0].description,
                price: data[0].price,
                imageUrl: data[0].image_url,
                category: data[0].category_name
            };
            setCakes(prev => [newCake, ...prev]);
        }
      }
      
      setFormCake({ category: categories[0] || 'Birthday' });
      setIsEditing(null);
      setActiveView(AdminView.CAKES);
    } catch (err: any) {
      console.error("Supabase Save Error:", err);
      alert(`Error saving: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCake = async (id: string) => {
    if (!window.confirm('Delete this cake permanently?')) return;
    const isRealDbItem = id.length > 10; 

    if (isRealDbItem) {
      try {
        const { error } = await supabase.from('cakes').delete().eq('id', id);
        if (error) {
          alert(`Database error: ${error.message}`);
          return;
        }
      } catch (err: any) {
        alert("A network error occurred.");
        return;
      }
    }
    setCakes(prev => prev.filter(c => c.id !== id));
  };

  const handleAddCategory = async () => {
    if (newCategory && !categories.includes(newCategory)) {
      const { error } = await supabase.from('categories').insert([{ name: newCategory }]);
      if (error) {
          alert(`Failed to add category: ${error.message}`);
          return;
      }
      setCategories(prev => [...prev, newCategory]);
      setNewCategory('');
    }
  };

  const handleDeleteCategory = async (cat: string) => {
    const { error } = await supabase.from('categories').delete().eq('name', cat);
    if (error) {
        alert(`Delete failed: ${error.message}.`);
        return;
    }
    setCategories(prev => prev.filter(c => c !== cat));
  };

  // Fix: Implemented handleAddCoupon to persist coupons and update local state
  const handleAddCoupon = async () => {
    if (newCoupon.code && newCoupon.discountPercent > 0) {
      try {
        const { error } = await supabase.from('coupons').insert([{ 
          code: newCoupon.code.toUpperCase(), 
          discount_percent: newCoupon.discountPercent 
        }]);
        if (error) {
          alert(`Failed to add coupon: ${error.message}`);
          return;
        }
        setCoupons(prev => [...prev, { ...newCoupon, code: newCoupon.code.toUpperCase() }]);
        setNewCoupon({ code: '', discountPercent: 10 });
      } catch (err: any) {
        alert("A network error occurred while adding coupon.");
      }
    }
  };

  // Fix: Implemented handleDeleteCoupon to remove coupons from database and local state
  const handleDeleteCoupon = async (code: string) => {
    if (!window.confirm(`Are you sure you want to delete the coupon "${code}"?`)) return;
    try {
      const { error } = await supabase.from('coupons').delete().eq('code', code);
      if (error) {
        alert(`Failed to delete coupon: ${error.message}`);
        return;
      }
      setCoupons(prev => prev.filter(c => c.code !== code));
    } catch (err: any) {
      alert("A network error occurred while deleting coupon.");
    }
  };

  const handleAiDescription = async () => {
    if (!formCake.name) {
      alert("Please enter a cake name first.");
      return;
    }
    setIsGeneratingAi(true);
    try {
      const desc = await generateDescription(formCake.name, formCake.category || categories[0] || 'Birthday');
      setFormCake(prev => ({ ...prev, description: desc }));
    } catch (err) {
      console.error("AI Gen error:", err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100] bg-midnight flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden text-center">
          <h2 className="text-4xl font-serif text-midnight mb-8">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 outline-none" placeholder="Username" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 outline-none" placeholder="Password" />
            {loginError && <p className="text-red-500 text-xs">{loginError}</p>}
            <button className="w-full bg-midnight text-white p-4 rounded-xl font-bold uppercase tracking-widest text-xs">Enter Dashboard</button>
            <button type="button" onClick={onClose} className="text-slate-400 text-xs uppercase tracking-widest mt-4">Close</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#F9FAFB] flex overflow-hidden">
      {/* Sidebar - Retained for Navigation */}
      <aside className="w-20 md:w-64 bg-white border-r border-slate-100 flex flex-col p-6 shrink-0 transition-all">
        <div className="flex items-center gap-3 mb-10 overflow-hidden">
            <div className="w-10 h-10 bg-midnight rounded-xl flex items-center justify-center text-white shrink-0">
              <span className="font-serif font-bold italic">F</span>
            </div>
            <h2 className="text-xl font-serif hidden md:block">Store Manager</h2>
        </div>
        <nav className="flex flex-col gap-2">
            {[
                { id: AdminView.CAKES, label: 'Inventory', icon: 'fa-box' },
                { id: AdminView.COUPONS, label: 'Coupons', icon: 'fa-ticket' }
            ].map(item => (
                <button 
                    key={item.id}
                    onClick={() => setActiveView(item.id as AdminView)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition ${
                        activeView === item.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
                    }`}
                >
                    <i className={`fa-solid ${item.icon} w-5`}></i>
                    <span className="hidden md:block">{item.label}</span>
                </button>
            ))}
        </nav>
        <button onClick={onClose} className="mt-auto flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-midnight transition text-xs font-bold uppercase tracking-widest">
            <i className="fa-solid fa-arrow-left"></i>
            <span className="hidden md:block">Exit</span>
        </button>
      </aside>

      <main className="flex-grow overflow-y-auto p-4 md:p-12">
        <div className="max-w-4xl mx-auto">
          {activeView === AdminView.CAKES && (
            <div className="animate-fade-up">
              {/* Categories Section from Image */}
              <div className="mb-12">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Store Categories</h3>
                <div className="flex flex-wrap gap-3 items-center">
                  {categories.map((cat, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full shadow-sm">
                      <span className="text-sm font-semibold text-slate-700">{cat}</span>
                      <button onClick={() => handleDeleteCategory(cat)} className="text-slate-300 hover:text-red-400 transition">
                        <i className="fa-solid fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm group focus-within:ring-2 focus-within:ring-orange-200 transition">
                    <input 
                      type="text" 
                      placeholder="New category..." 
                      className="bg-transparent text-sm outline-none w-32 placeholder:text-slate-300"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                    />
                    <button onClick={handleAddCategory} className="text-emerald-400 hover:text-emerald-600">
                      <i className="fa-solid fa-plus text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Inventory Section from Image */}
              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-slate-800 mb-2">Product Inventory</h3>
                <p className="text-slate-400 text-sm mb-8">Update products, prices, and stock levels.</p>
                <button 
                  onClick={() => { setActiveView(AdminView.DASHBOARD); setIsEditing(null); setFormCake({ category: categories[0] }); }}
                  className="bg-[#FFB84C] hover:bg-[#ffa929] text-midnight px-12 py-4 rounded-full font-bold uppercase tracking-widest text-sm shadow-xl shadow-orange-200 flex items-center gap-3 mx-auto transition-transform active:scale-95"
                >
                  <i className="fa-solid fa-plus"></i>
                  Create Product
                </button>
              </div>

              {/* Inventory List from Image */}
              <div className="space-y-4">
                {cakes.map(cake => (
                  <div key={cake.id} className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-50 flex items-center gap-6 group hover:shadow-md transition-shadow">
                    <img src={cake.imageUrl} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" />
                    <div className="flex-grow">
                      <h4 className="font-bold text-slate-800 text-lg leading-tight truncate max-w-[200px]">{cake.name}</h4>
                      <p className="text-emerald-500 font-bold text-xs uppercase tracking-wider">
                        UGX {cake.price.toLocaleString()} • {cake.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      {/* Toggle Switch */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button 
                           onClick={() => { setIsEditing(cake.id); setFormCake(cake); setActiveView(AdminView.DASHBOARD); }}
                           className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-midnight transition border border-transparent hover:border-slate-200"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button 
                           onClick={() => handleDeleteCake(cake.id)}
                           className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 transition border border-transparent hover:border-red-100"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === AdminView.DASHBOARD && (
            <div className="animate-fade-up">
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setActiveView(AdminView.CAKES)} className="text-slate-400 hover:text-midnight font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                  <i className="fa-solid fa-arrow-left"></i> Back to Inventory
                </button>
                <h3 className="text-2xl font-bold text-slate-800">{isEditing ? 'Edit Product' : 'New Product'}</h3>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-black/5">
                <form onSubmit={handleSaveCake} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Product Image</label>
                      <div className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] overflow-hidden flex items-center justify-center relative group">
                        {formCake.imageUrl ? (
                          <img src={formCake.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                          <i className="fa-solid fa-camera text-4xl text-slate-200"></i>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setFormCake(prev => ({ ...prev, imageUrl: reader.result as string }));
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <input type="text" placeholder="Product Name" className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none" value={formCake.name || ''} onChange={e => setFormCake(prev => ({ ...prev, name: e.target.value }))} required />
                    <input type="number" placeholder="Price (UGX)" className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none" value={formCake.price || ''} onChange={e => setFormCake(prev => ({ ...prev, price: Number(e.target.value) }))} required />
                    <select className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none" value={formCake.category} onChange={e => setFormCake(prev => ({ ...prev, category: e.target.value }))}>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <div className="relative">
                      <textarea placeholder="Product Description" className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none h-32 resize-none" value={formCake.description || ''} onChange={e => setFormCake(prev => ({ ...prev, description: e.target.value }))} required />
                      <button 
                        type="button" 
                        onClick={handleAiDescription}
                        disabled={isGeneratingAi}
                        className="absolute bottom-4 right-4 text-rose-gold hover:text-rose-gold-dark text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 bg-white/80 backdrop-blur px-2 py-1 rounded-lg"
                      >
                        {isGeneratingAi ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                        AI Gen
                      </button>
                    </div>
                    <button disabled={isSaving} className="w-full bg-[#FFB84C] text-midnight py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg disabled:opacity-50 transition-all hover:bg-[#ffa929]">
                      {isSaving ? 'Saving...' : 'Confirm Details'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeView === AdminView.COUPONS && (
            <div className="animate-fade-up">
              <h3 className="text-3xl font-bold text-slate-800 mb-8">Promotion Engine</h3>
              {/* Simplified Coupon Management */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 mb-8">
                 <div className="flex flex-col md:flex-row gap-4">
                    <input type="text" placeholder="CODE" className="flex-grow p-4 bg-slate-50 rounded-xl outline-none font-bold uppercase" value={newCoupon.code} onChange={e => setNewCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))} />
                    <input type="number" placeholder="%" className="w-24 p-4 bg-slate-50 rounded-xl outline-none font-bold" value={newCoupon.discountPercent} onChange={e => setNewCoupon(prev => ({ ...prev, discountPercent: Number(e.target.value) }))} />
                    <button onClick={handleAddCoupon} className="bg-midnight text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs">Add</button>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coupons.map((c, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-50 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-midnight">{c.code}</p>
                      <p className="text-xs text-slate-400 uppercase font-bold">{c.discountPercent}% Discount</p>
                    </div>
                    <button onClick={() => handleDeleteCoupon(c.code)} className="text-red-300 hover:text-red-500">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
