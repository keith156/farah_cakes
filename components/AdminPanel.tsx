
import React, { useState, useEffect } from 'react';
import { Cake, Coupon, AdminView } from '../types';

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
  
  const [activeView, setActiveView] = useState<AdminView>(AdminView.DASHBOARD);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formCake, setFormCake] = useState<Partial<Cake>>({ category: categories[0] || 'Birthday' });
  
  const [newCoupon, setNewCoupon] = useState({ code: '', discountPercent: 10 });
  const [newCategory, setNewCategory] = useState('');

  // Update default category in form if categories change
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
    const cakeToSave = {
      ...formCake,
      id: isEditing || Date.now().toString(),
      name: formCake.name || 'Unnamed Cake',
      description: formCake.description || 'No description provided.',
      price: Number(formCake.price) || 0,
      imageUrl: formCake.imageUrl || 'https://picsum.photos/800/600',
      category: formCake.category || categories[0] || 'General'
    } as Cake;

    if (isEditing) {
      setCakes(prev => prev.map(c => c.id === isEditing ? cakeToSave : c));
    } else {
      setCakes(prev => [cakeToSave, ...prev]);
    }
    
    setFormCake({ category: categories[0] || 'Birthday' });
    setIsEditing(null);
    setActiveView(AdminView.CAKES);
  };

  const handleDeleteCake = (id: string) => {
    if (window.confirm('Delete this cake permanently?')) {
      setCakes(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormCake(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory]);
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (cat: string) => {
    if (window.confirm(`Delete category "${cat}"? Cakes currently in this category will remain, but the category won't show in the shop filters if no cakes are left.`)) {
      setCategories(prev => prev.filter(c => c !== cat));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100] bg-midnight flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-rose-gold"></div>
          <div className="text-center mb-10">
            <h2 className="text-4xl font-serif text-midnight mb-2">Staff Gateway</h2>
            <p className="text-slate-400 text-sm">Welcome back to the bakery dashboard.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-rose-gold/20 transition" 
                placeholder="Username"
              />
            </div>
            <div>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-rose-gold/20 transition" 
                placeholder="Password"
              />
            </div>
            {loginError && <p className="text-red-500 text-xs text-center font-bold uppercase tracking-widest">{loginError}</p>}
            <button className="w-full bg-midnight text-white p-5 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-slate-800 transition shadow-xl shadow-midnight/10">
              Access Dashboard
            </button>
            <button type="button" onClick={onClose} className="w-full text-slate-400 text-xs font-bold uppercase tracking-[0.2em] pt-4">Return to Store</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8F9FA] flex flex-col md:flex-row">
      {/* Sidebar Nav */}
      <aside className="w-full md:w-64 bg-midnight text-white flex flex-col p-8 shrink-0">
        <div className="flex items-center gap-4 mb-12">
            <div className="w-10 h-10 bg-rose-gold rounded-xl flex items-center justify-center">
              <span className="font-serif font-bold italic">F</span>
            </div>
            <h2 className="text-xl font-serif tracking-tight">Admin</h2>
        </div>
        
        <nav className="flex flex-col gap-2">
            {[
                { id: AdminView.DASHBOARD, label: 'Add Cake', icon: 'fa-plus' },
                { id: AdminView.CAKES, label: 'Inventory', icon: 'fa-boxes' },
                { id: AdminView.CATEGORIES, label: 'Categories', icon: 'fa-tags' },
                { id: AdminView.COUPONS, label: 'Coupons', icon: 'fa-ticket' }
            ].map(item => (
                <button 
                    key={item.id}
                    onClick={() => setActiveView(item.id as AdminView)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition ${
                        activeView === item.id ? 'bg-rose-gold text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <i className={`fa-solid ${item.icon}`}></i>
                    {item.label}
                </button>
            ))}
        </nav>
        
        <button onClick={onClose} className="mt-auto flex items-center gap-4 px-6 py-4 text-slate-500 hover:text-white transition text-xs font-bold uppercase tracking-widest">
            <i className="fa-solid fa-arrow-left-long"></i>
            Storefront
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow overflow-y-auto p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
            {activeView === AdminView.DASHBOARD && (
                <div className="animate-fade-up">
                    <h3 className="text-4xl font-serif text-midnight mb-8">{isEditing ? 'Edit Masterpiece' : 'Add New Creation'}</h3>
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-black/5">
                        <form onSubmit={handleSaveCake} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-8 flex flex-col">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Masterpiece Visual</label>
                                    <div className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] overflow-hidden flex items-center justify-center relative group">
                                        {formCake.imageUrl ? (
                                            <>
                                                <img src={formCake.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                                <div className="absolute inset-0 bg-midnight/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="bg-white text-midnight px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer">Change Image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-8">
                                                <i className="fa-solid fa-image text-4xl text-slate-200 mb-4"></i>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Upload Portrait Photo</p>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                                    </div>
                                </div>
                                
                                <button className="hidden lg:block w-full bg-midnight text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-slate-800 transition shadow-xl mt-auto">
                                    {isEditing ? 'Save Changes' : 'Launch Listing'}
                                </button>
                                {isEditing && (
                                    <button 
                                        type="button" 
                                        onClick={() => { setIsEditing(null); setFormCake({ category: categories[0] || 'Birthday' }); }}
                                        className="hidden lg:block text-slate-400 text-xs font-bold uppercase tracking-widest mt-4"
                                    >
                                        Discard Changes
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Cake Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formCake.name || ''}
                                        onChange={e => setFormCake(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-rose-gold/20" 
                                        placeholder="e.g. Belgian Truffle Noir"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Price (UGX)</label>
                                        <input 
                                            type="number" 
                                            required
                                            value={formCake.price || ''}
                                            onChange={e => setFormCake(prev => ({ ...prev, price: Number(e.target.value) }))}
                                            className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-rose-gold/20" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Category</label>
                                        <select 
                                            value={formCake.category || categories[0] || 'Birthday'}
                                            onChange={e => setFormCake(prev => ({ ...prev, category: e.target.value }))}
                                            className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-rose-gold/20 appearance-none"
                                        >
                                            {categories.map(cat => (
                                              <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                            {categories.length === 0 && <option>General</option>}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Description</label>
                                    <textarea 
                                        required
                                        value={formCake.description || ''}
                                        onChange={e => setFormCake(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-rose-gold/20 h-40 resize-none"
                                        placeholder="Describe the layers of flavor..."
                                    />
                                </div>
                                
                                <button className="lg:hidden w-full bg-midnight text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-slate-800 transition shadow-xl">
                                    {isEditing ? 'Save Changes' : 'Launch Listing'}
                                </button>
                                {isEditing && (
                                    <button 
                                        type="button" 
                                        onClick={() => { setIsEditing(null); setFormCake({ category: categories[0] || 'Birthday' }); }}
                                        className="lg:hidden text-slate-400 text-xs font-bold uppercase tracking-widest mt-4"
                                    >
                                        Discard Changes
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeView === AdminView.CAKES && (
                <div className="animate-fade-up">
                    <h3 className="text-4xl font-serif text-midnight mb-8">Bakery Inventory</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {cakes.map(cake => (
                            <div key={cake.id} className="bg-white p-6 rounded-3xl shadow-sm border border-white hover:border-slate-100 transition flex gap-6 items-center">
                                <img src={cake.imageUrl} className="w-24 h-24 object-cover rounded-2xl flex-shrink-0 shadow-inner" alt="" />
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-serif text-xl text-midnight mb-1">{cake.name}</h4>
                                      <span className="text-[9px] uppercase font-bold tracking-widest bg-slate-50 text-slate-400 px-2 py-1 rounded-full">{cake.category}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium mb-4">{new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(cake.price)}</p>
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => { 
                                                setIsEditing(cake.id); 
                                                setFormCake(cake);
                                                setActiveView(AdminView.DASHBOARD);
                                            }}
                                            className="text-rose-gold text-[10px] font-bold uppercase tracking-widest hover:text-midnight transition"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteCake(cake.id)}
                                            className="text-red-400 text-[10px] font-bold uppercase tracking-widest hover:text-red-600 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeView === AdminView.CATEGORIES && (
                <div className="animate-fade-up">
                    <h3 className="text-4xl font-serif text-midnight mb-8">Categories</h3>
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-black/5 mb-12">
                        <div className="flex gap-4 items-end">
                            <div className="flex-grow">
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">New Category Name</label>
                                <input 
                                    type="text" 
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                    placeholder="e.g. Pastries"
                                    className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-rose-gold/20 font-bold"
                                />
                            </div>
                            <button 
                                onClick={handleAddCategory}
                                className="bg-midnight text-white py-4 px-8 rounded-2xl font-bold uppercase tracking-widest text-xs h-[56px] hover:bg-slate-800 transition"
                            >
                                Add Category
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((cat, i) => (
                            <div key={i} className="bg-white p-6 rounded-3xl border border-white shadow-sm flex items-center justify-between group">
                                <p className="text-midnight font-bold tracking-widest uppercase text-sm">{cat}</p>
                                <button 
                                    onClick={() => handleDeleteCategory(cat)}
                                    className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 transition"
                                >
                                    <i className="fa-solid fa-trash-can text-sm"></i>
                                </button>
                            </div>
                        ))}
                        {categories.length === 0 && (
                          <div className="col-span-full py-12 text-center text-slate-400 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
                             No categories added yet.
                          </div>
                        )}
                    </div>
                </div>
            )}

            {activeView === AdminView.COUPONS && (
                <div className="animate-fade-up">
                    <h3 className="text-4xl font-serif text-midnight mb-8">Promotion Engine</h3>
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-black/5 mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Coupon Code</label>
                                <input 
                                    type="text" 
                                    value={newCoupon.code}
                                    onChange={e => setNewCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                    placeholder="e.g. SUMMER25"
                                    className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-rose-gold/20 uppercase tracking-widest font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Discount (%)</label>
                                <input 
                                    type="number" 
                                    value={newCoupon.discountPercent}
                                    onChange={e => setNewCoupon(prev => ({ ...prev, discountPercent: Number(e.target.value) }))}
                                    className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-rose-gold/20 font-bold"
                                />
                            </div>
                            <button 
                                onClick={() => { if(newCoupon.code) { setCoupons(prev => [...prev, newCoupon]); setNewCoupon({code: '', discountPercent: 10}); } }}
                                className="bg-midnight text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs h-[56px] hover:bg-slate-800 transition"
                            >
                                Generate Coupon
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coupons.map((c, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl border border-white shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-rose-gold font-bold tracking-[0.2em] uppercase text-sm mb-1">{c.code}</p>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{c.discountPercent}% OFF</p>
                                </div>
                                <button 
                                    onClick={() => setCoupons(prev => prev.filter((_, idx) => idx !== i))}
                                    className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 transition"
                                >
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