"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Package, Edit3, Trash2, 
  ImageIcon, Loader2, Tag, Layers, AlertCircle 
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Product = {
  id: string;
  name: string;
  price: number;
  wholesale_price: number | null;
  moq: number | null; 
  stock: number | null;
  image_url: string | null;
  is_active: boolean;
};

export default function ProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'retail' | 'wholesale'>('all');

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu_items') 
        .select('id, name, price, wholesale_price, moq, stock, image_url, is_active')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string | null) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

    try {
      // 1. Delete from Database
      const { error: dbError } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // 2. Delete Image from Storage if it exists
      if (imageUrl) {
        const path = imageUrl.split('product-images/')[1];
        if (path) {
          await supabase.storage.from('product-images').remove([path]);
        }
      }

      // 3. Update UI State
      setProducts(products.filter(p => p.id !== id));
    } catch (error: any) {
      alert("Error deleting product: " + error.message);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'wholesale') return product.wholesale_price !== null && product.wholesale_price > 0;
    if (activeTab === 'retail') return (product.wholesale_price === null || product.wholesale_price === 0);
    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic mb-1 transition-colors">
            Inventory <span className="text-brand-orange">&</span> Assets
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            Manage your retail and B2B wholesale showroom.
          </p>
        </div>

        <Link href="/products/add">
          <button className="bg-brand-orange text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-glow-orange">
            <Plus size={18} /> Add New Asset
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex p-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm shrink-0">
          {(['all', 'retail', 'wholesale'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-md' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search assets by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full min-h-[52px] pl-12 pr-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none text-sm font-bold placeholder:text-slate-400 focus:border-brand-orange transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-[32px] border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[450px]">
            <Loader2 size={40} className="animate-spin text-brand-orange mb-4" />
            <p className="text-[10px] font-black uppercase text-slate-400">Syncing with database...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Asset Detail</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Retail</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Wholesale (MOQ)</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Status</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredProducts.map((product, idx) => (
                  <motion.tr 
                    key={product.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                    className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex items-center justify-center overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} className="w-full h-full object-cover" alt={product.name} />
                          ) : (
                            <ImageIcon size={20} className="text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-sm text-slate-900 dark:text-white uppercase italic">{product.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Stock: {product.stock ?? '∞'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-mono font-bold text-sm text-slate-900 dark:text-white">
                      ₦{(product.price || 0).toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      {product.wholesale_price ? (
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-sm text-brand-orange">₦{product.wholesale_price.toLocaleString()}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Min Order: {product.moq || 1}</span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-black text-slate-400/50 uppercase">Retail Only</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${product.is_active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                        {product.is_active ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/products/add?id=${product.id}`}>
                          <button className="p-3 bg-white dark:bg-white/10 rounded-xl text-slate-500 hover:text-brand-orange border border-slate-200 dark:border-white/5 transition-all active:scale-95">
                            <Edit3 size={16} />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id, product.image_url)}
                          className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-500 hover:bg-red-500 hover:text-white border border-red-100 dark:border-red-500/20 transition-all active:scale-95"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[450px] text-center px-6">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-[32px] flex items-center justify-center text-slate-300 mb-6 border border-slate-200 dark:border-white/10">
              <Package size={40} strokeWidth={1} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Showroom Empty</h3>
            <p className="text-[10px] font-bold text-slate-500 max-w-sm mt-2 uppercase tracking-widest">You haven't added any assets to your catalog yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
