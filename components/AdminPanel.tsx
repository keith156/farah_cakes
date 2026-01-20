
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
        <div className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl relative overflow-hidden text-center">
          <div className="w-20 h-20 bg-primary-yellow rounded-[2rem] mx-auto mb-8 flex items-center justify-center text-midnight shadow-lg shadow-primary-yellow/20">
            <i className="fa-solid fa-lock text-3xl"></i>
          </div>
          <h2 className="text-3xl font-serif text-midnight mb-8 font-bold">Manager Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#f4f7f9] p-5 rounded-2xl outline-none border border-transparent focus:border-primary-yellow transition font-medium" placeholder="Username" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#f4f7f9] p-5 rounded-2xl outline-none border border-transparent focus:border-primary-yellow transition font-medium" placeholder="Password" />
            {loginError && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{loginError}</p>}
            <button className="w-full bg-midnight text-white p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all">Access Dashboard</button>
            <button type="button" onClick={onClose} className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-6">Back to Shop</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#f8fafc] flex flex-col md:flex-row overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-100 flex-col p-10 shrink-0">
        <div className="flex items-center gap-4 mb-14">
            <div className="w-12 h-12 bg-midnight rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-midnight/10">
              <span className="font-serif font-bold italic text-lg">F</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-midnight">Manager</h2>
        </div>
        <nav className="flex flex-col gap-4">
            {[
                { id: AdminView.CAKES, label: 'Inventory', icon: 'fa-box-archive' },
                { id: AdminView.COUPONS, label: 'Promotions', icon: 'fa-ticket' }
            ].map(item => (
                <button 
                    key={item.id}
                    onClick={() => setActiveView(item.id as AdminView)}
                    className={`flex items-center gap-5 px-8 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                        activeView === item.id ? 'bg-midnight text-white shadow-xl shadow-midnight/10 scale-[1.02]' : 'text-slate-400 hover:bg-slate-50'
                    }`}
                >
                    <i className={`fa-solid ${item.icon} text-lg`}></i>
                    <span>{item.label}</span>
                </button>
            ))}
        </nav>
        <button onClick={onClose} className="mt-auto flex items-center gap-5 px-8 py-5 text-slate-400 hover:text-red-500 transition-all text-[10px] font-black uppercase tracking-[0.2em]">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <span>Exit Store</span>
        </button>
      </aside>

      {/* Mobile Bottom Navigation - Improved icon matching and layout to prevent overlap */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-8 py-4 flex justify-between items-end z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        <button 
            onClick={() => setActiveView(AdminView.CAKES)}
            className={`flex flex-col items-center gap-2 transition-all min-w-[60px] ${
                activeView === AdminView.CAKES ? 'text-midnight scale-105' : 'text-slate-300'
            }`}
        >
            <i className="fa-solid fa-layer-group text-xl"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Items</span>
        </button>

        <button 
            onClick={() => setActiveView(AdminView.COUPONS)}
            className={`flex flex-col items-center gap-2 transition-all min-w-[60px] ${
                activeView === AdminView.COUPONS ? 'text-midnight scale-105' : 'text-slate-300'
            }`}
        >
            <i className="fa-solid fa-ticket-simple text-xl"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Promos</span>
        </button>

        <button 
            onClick={() => { setActiveView(AdminView.DASHBOARD); setIsEditing(null); setFormCake({ category: categories[0] }); }}
            className="flex flex-col items-center gap-2 min-w-[60px]"
        >
            <div className="w-14 h-14 bg-accent-emerald text-white rounded-full flex items-center justify-center -mb-4 shadow-xl shadow-accent-emerald/30 border-4 border-white active:scale-90 transition-transform">
                <i className="fa-solid fa-plus text-2xl"></i>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-accent-emerald mt-4">New</span>
        </button>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden bg-white px-8 py-6 border-b border-slate-50 flex items-center justify-between">
        <h2 className="text-2xl font-bold font-serif text-midnight">
            {activeView === AdminView.CAKES ? 'Inventory' : activeView === AdminView.COUPONS ? 'Offers' : 'Create'}
        </h2>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
            <i className="fa-solid fa-xmark text-lg"></i>
        </button>
      </header>

      <main className="flex-grow overflow-y-auto p-6 md:p-16 pb-32 md:pb-16 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto">
          {activeView === AdminView.CAKES && (
            <div className="animate-fade-up">
              {/* Categories */}
              <div className="mb-12">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Store Categories</h3>
                <div className="flex flex-wrap gap-2.5">
                  {categories.map((cat, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-100 rounded-full shadow-sm transition-all active:scale-95 group">
                      <span className="text-xs font-bold text-midnight">{cat}</span>
                      <button onClick={() => handleDeleteCategory(cat)} className="text-slate-300 hover:text-red-500 opacity-50 hover:opacity-100 transition-opacity">
                        <i className="fa-solid fa-circle-xmark text-sm"></i>
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-dashed border-slate-200 rounded-full focus-within:border-accent-emerald focus-within:shadow-md transition-all">
                    <input 
                      type="text" 
                      placeholder="New Category..." 
                      className="bg-transparent text-xs font-bold outline-none w-28 placeholder:text-slate-300"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                    />
                    <button onClick={handleAddCategory} className="text-accent-emerald hover:scale-110 transition-transform">
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Inventory Content */}
              <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-3xl font-bold text-midnight mb-1 font-serif">Inventory</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{cakes.length} Products Online</p>
                </div>
                <button 
                  onClick={() => { setActiveView(AdminView.DASHBOARD); setIsEditing(null); setFormCake({ category: categories[0] }); }}
                  className="hidden md:flex bg-primary-yellow hover:bg-primary-yellow-dark text-midnight px-10 py-4 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary-yellow/10 items-center gap-3 transition-all active:scale-95 border-b-4 border-primary-yellow-dark"
                >
                  <i className="fa-solid fa-plus text-sm"></i>
                  New Product
                </button>
              </div>

              {/* Items List - Fixed Overlapping logic */}
              <div className="space-y-4">
                {cakes.map(cake => (
                  <div key={cake.id} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-50 flex items-center gap-4 md:gap-6 group hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] overflow-hidden shrink-0 bg-[#f4f7f9] shadow-inner">
                      <img src={cake.imageUrl} className="w-full h-full object-cover" alt="" />
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-midnight text-base md:text-xl truncate leading-tight mb-0.5">
                        {cake.name.toLowerCase()}
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 overflow-hidden">
                        <span className="text-accent-emerald font-black text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap">
                          UGX {cake.price.toLocaleString()}
                        </span>
                        <span className="hidden sm:inline text-slate-200 text-[10px]">•</span>
                        <span className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-wider truncate">
                          {cake.category.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-6 shrink-0">
                      {/* Custom Switch Component */}
                      <label className="relative inline-flex items-center cursor-pointer scale-90 md:scale-100">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-12 md:w-14 h-6 md:h-7 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 md:peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 md:after:h-5 after:w-4 md:after:w-5 after:transition-all peer-checked:bg-accent-emerald"></div>
                      </label>
                      
                      <div className="flex gap-1 md:gap-2">
                        <button 
                           onClick={() => { setIsEditing(cake.id); setFormCake(cake); setActiveView(AdminView.DASHBOARD); }}
                           className="w-9 md:w-10 h-9 md:h-10 flex items-center justify-center rounded-[0.8rem] md:rounded-[1rem] bg-slate-50 text-slate-400 hover:text-midnight hover:bg-slate-100 transition-all active:scale-90"
                        >
                          <i className="fa-solid fa-pen-to-square text-xs md:text-sm"></i>
                        </button>
                        <button 
                           onClick={() => handleDeleteCake(cake.id)}
                           className="hidden sm:flex w-9 md:w-10 h-9 md:h-10 items-center justify-center rounded-[0.8rem] md:rounded-[1rem] bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                        >
                          <i className="fa-solid fa-trash-can text-xs md:text-sm"></i>
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
              <div className="flex items-center justify-between mb-10">
                <button onClick={() => setActiveView(AdminView.CAKES)} className="hidden md:flex text-slate-400 hover:text-midnight font-black uppercase tracking-widest text-[10px] items-center gap-3">
                  <i className="fa-solid fa-chevron-left"></i> Back to Inventory
                </button>
                <h3 className="text-3xl font-bold text-midnight font-serif w-full md:w-auto text-center md:text-left">
                    {isEditing ? 'Refine Product' : 'Fresh Creation'}
                </h3>
              </div>
              <div className="bg-white p-8 md:p-14 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50">
                <form onSubmit={handleSaveCake} className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Featured Photo</label>
                      <div className="aspect-square bg-[#f4f7f9] border-2 border-dashed border-slate-200 rounded-[2.5rem] overflow-hidden flex items-center justify-center relative group active:scale-95 transition-all shadow-inner">
                        {formCake.imageUrl ? (
                          <img src={formCake.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center text-slate-300">
                             <i className="fa-solid fa-cloud-arrow-up text-4xl mb-4 opacity-50"></i>
                             <p className="text-[10px] font-black uppercase tracking-widest">Select Visual</p>
                          </div>
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
                        {formCake.imageUrl && (
                          <div className="absolute inset-0 bg-midnight/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur px-6 py-3 rounded-full">Change</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-5">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Title</label>
                           <input type="text" placeholder="e.g. Vanilla Bean Cloud" className="w-full p-5 bg-[#f4f7f9] border border-transparent rounded-2xl outline-none focus:bg-white focus:border-primary-yellow focus:shadow-sm transition-all font-bold" value={formCake.name || ''} onChange={e => setFormCake(prev => ({ ...prev, name: e.target.value }))} required />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Selling Price</label>
                           <input type="number" placeholder="Amount in UGX" className="w-full p-5 bg-[#f4f7f9] border border-transparent rounded-2xl outline-none focus:bg-white focus:border-primary-yellow focus:shadow-sm transition-all font-bold" value={formCake.price || ''} onChange={e => setFormCake(prev => ({ ...prev, price: Number(e.target.value) }))} required />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                           <select className="w-full p-5 bg-[#f4f7f9] border border-transparent rounded-2xl outline-none focus:bg-white focus:border-primary-yellow focus:shadow-sm transition-all text-sm font-bold appearance-none cursor-pointer" value={formCake.category} onChange={e => setFormCake(prev => ({ ...prev, category: e.target.value }))}>
                             {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2 relative">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Story</label>
                           <textarea placeholder="Tell your customers about this treat..." className="w-full p-5 bg-[#f4f7f9] border border-transparent rounded-2xl outline-none focus:bg-white focus:border-primary-yellow focus:shadow-sm transition-all h-36 resize-none text-sm font-medium" value={formCake.description || ''} onChange={e => setFormCake(prev => ({ ...prev, description: e.target.value }))} required />
                           <button 
                             type="button" 
                             onClick={handleAiDescription}
                             disabled={isGeneratingAi}
                             className="absolute bottom-4 right-4 text-accent-emerald hover:text-emerald-600 text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md border border-slate-100 transition-all active:scale-90"
                           >
                             {isGeneratingAi ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                             {isGeneratingAi ? 'Dreaming...' : 'AI Enhance'}
                           </button>
                        </div>
                    </div>
                    <button disabled={isSaving} className="w-full bg-midnight text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-midnight/20 disabled:opacity-50 transition-all hover:bg-slate-800 active:scale-95 mt-4">
                      {isSaving ? 'Syncing...' : (isEditing ? 'Save Changes' : 'Publish to Shop')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeView === AdminView.COUPONS && (
            <div className="animate-fade-up">
              <h3 className="text-3xl font-bold text-midnight mb-10 font-serif">Promo Manager</h3>
              <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-50 shadow-2xl shadow-slate-200/50 mb-12">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Generate New Campaign</p>
                 <div className="flex flex-col md:flex-row gap-5">
                    <input type="text" placeholder="CODE (e.g. FLASH25)" className="flex-grow p-6 bg-[#f4f7f9] rounded-2xl outline-none font-black uppercase tracking-[0.2em] text-sm focus:bg-white focus:border-accent-emerald border border-transparent transition-all" value={newCoupon.code} onChange={e => setNewCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))} />
                    <input type="number" placeholder="%" className="w-full md:w-32 p-6 bg-[#f4f7f9] rounded-2xl outline-none font-black text-sm focus:bg-white focus:border-accent-emerald border border-transparent transition-all" value={newCoupon.discountPercent} onChange={e => setNewCoupon(prev => ({ ...prev, discountPercent: Number(e.target.value) }))} />
                    <button onClick={handleAddCoupon} className="bg-accent-emerald text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl shadow-accent-emerald/10">Launch Code</button>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coupons.map((c, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex items-center justify-between group transition-all hover:shadow-xl hover:scale-[1.02]">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 bg-accent-emerald/10 text-accent-emerald rounded-2xl flex items-center justify-center text-2xl">
                          <i className="fa-solid fa-tag"></i>
                       </div>
                       <div>
                         <p className="font-black text-midnight tracking-[0.2em] text-xl uppercase mb-1">{c.code}</p>
                         <p className="text-[10px] text-accent-emerald font-black uppercase tracking-[0.2em]">{c.discountPercent}% SAVINGS</p>
                       </div>
                    </div>
                    <button onClick={() => handleDeleteCoupon(c.code)} className="w-12 h-12 rounded-full bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center">
                      <i className="fa-solid fa-trash-can text-sm"></i>
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
